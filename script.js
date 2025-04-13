<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>
        English Learning Cards
    </title>
    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="#ffffff">

    <link href="style.css" rel="stylesheet"/>
    <script defer="" src="script.js">
    </script>
    <script defer="" src="quiz.js">
    </script>
    <script defer="" src="wordhear.js">
    </script>
    <script defer="" src="makeword.js">
    </script>
    <script defer="" src="utils.js">
    </script>
    <script defer="" src="mix.js">
    </script>
    <script defer="" src="typegame.js">
    </script>
    <script defer="" src="sentence.js">
    </script>
    <script defer="" src="puzzle.js">
    </script>
    <script src="tts.js"></script>
    <script>
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js')
                .then(() => console.log("✅ Service Worker რეგისტრირებულია"))
                .catch(err => console.error("❌ SW error:", err));
        }
    </script>

    <!-- შენიშნე, რომ ორი ახალი ფუნქცია დაგვჭირდება:
            getDocs, doc, setDoc, deleteDoc -->
    <script type="module">
        import {
            initializeApp
        } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
        import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging.js";
        import {
            getFirestore,
            collection,
            addDoc,
            getDocs,
            doc,
            setDoc,
            deleteDoc
        } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

        const firebaseConfig = {
            apiKey: "AIzaSyArftPeH-SoIwmm2aKLDHBTE8M4DQ5jLM8",
            authDomain: "worded-1a455.firebaseapp.com",
            projectId: "worded-1a455",
            storageBucket: "worded-1a455.appspot.com",
            messagingSenderId: "385741553786",
            appId: "1:385741553786:web:c9e1d0d5bb662950f9fbc3",
            measurementId: "G-9QPQ3JE2MZ"
        };

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const messaging = getMessaging(app);


        document.getElementById("pullFromFirestoreBtn").addEventListener("click", pullAllCardsFromFirebase);


        getToken(messaging, { vapidKey: '385741553786' }).then((currentToken) => {
            if (currentToken) {
                console.log("✅ Token:", currentToken);
            } else {
                console.warn('❌ Token-ის მიღება ვერ მოხერხდა.');
            }
        }).catch((err) => {
            console.error('❌ FCM token შეცდომა:', err);
        });
        async function pullAllCardsFromFirebase() {
            try {
                const snapshot = await getDocs(collection(db, "cards"));
                const fetchedCards = [];

                // ლოკალური მონაცემების წამოღება
                const stored = localStorage.getItem("english_cards_app");
                const localData = stored ? JSON.parse(stored) : { cards: [] };

                const localWordsMap = {};
                localData.cards.forEach(card => {
                    localWordsMap[card.word.trim().toLowerCase()] = card;
                });

                snapshot.forEach(docSnap => {
                    const cardData = docSnap.data();
                    const wordKey = cardData.word.trim().toLowerCase();
                    cardData.firebaseId = docSnap.id;

                    if (localWordsMap[wordKey]) {
                        // უკვე არსებობს → განახლება
                        (cardData.tags || []).forEach(tag => allTags.add(tag));

                        Object.assign(localWordsMap[wordKey], {
                            ...cardData,
                            firebaseId: docSnap.id,

                        });
                    } else {
                        (cardData.tags || []).forEach(tag => allTags.add(tag));

                        // ახალი სიტყვა
                        fetchedCards.push(cardData);
                    }
                    renderSidebarTags();
                    populateGlobalTags();
                    renderTagLibrary();

                });

                const combinedCards = [...localData.cards, ...fetchedCards];

                // შევინახოთ
                localStorage.setItem("english_cards_app", JSON.stringify({ cards: combinedCards }));

                // UI განახლება
                if (window.loadCardsFromStorage) {
                    document.getElementById('cardContainer').innerHTML = '';
                    window.loadCardsFromStorage();

                    // ყველა ვიზუალი განახლდეს (progress bar და mastered)
                    document.querySelectorAll('.card').forEach(updateCardVisuals);

                }

                alert("✔ Firestore-დან იმპორტი წარმატებით დასრულდა!");

            } catch (err) {
                console.error("❌ Firestore Load შეცდომა:", err);
                alert("ვერ მოხერხდა ჩამოტვირთვა Firestore-დან!");
            }
        }




        document.getElementById("syncAllBtn").addEventListener("click", () => {
            syncAllCardsToFirebase()
                .then(() => {
                    alert("სინქრონიზაცია დასრულდა წარმატებით!");
                })
                .catch(err => {
                    console.error("სინქრონიზაციის შეცდომა:", err);
                    alert("სინქრონიზაცია ვერ მოხერხდა!");
                });
        });

        async function syncAllCardsToFirebase() {
            const stored = localStorage.getItem("english_cards_app");
            if (!stored) {
                throw new Error("ლოკალურ შენახვაში მონაცემები ვერ მოიძებნა");
            }

            const data = JSON.parse(stored);
            const localWordsMap = {};
            const fetchedCards = [];

            // mapify
            data.cards.forEach(card => {
                const wordKey = card.word.trim().toLowerCase();
                localWordsMap[wordKey] = card;
            });

            const snapshot = await getDocs(collection(db, "cards"));
            const serverMap = {};

            snapshot.forEach(docSnap => {
                const cardData = docSnap.data();
                const wordKey = cardData.word.trim().toLowerCase();
                cardData.firebaseId = docSnap.id;

                serverMap[docSnap.id] = cardData;

                if (localWordsMap[wordKey]) {
                    Object.assign(localWordsMap[wordKey], {
                        ...cardData,
                        firebaseId: docSnap.id,
                    });
                } else {
                    fetchedCards.push(cardData);
                }
            });


            // 3. თუ localStorage-ში არის ბარათები, ატვირთე/განაახლე
            if (data.cards && data.cards.length) {
                for (const card of data.cards) {
                    const docData = {
                        word: card.word,
                        mainTranslations: card.mainTranslations,
                        extraTranslations: card.extraTranslations,
                        tags: card.tags,
                        englishSentences: card.englishSentences,
                        georgianSentences: card.georgianSentences,
                        progress: card.progress || 0,
                        updated: Date.now()
                    };

                    if (!card.firebaseId) {
                        // ახალი ბარათი
                        const docRef = await addDoc(collection(db, "cards"), docData);
                        card.firebaseId = docRef.id;
                    } else {
                        // არსებული ბარათი
                        await setDoc(doc(db, "cards", card.firebaseId), docData, { merge: true });
                    }
                }
            }

            // 4. წაშლა Firestore-ში არსებული დოკების, რომლებიც ლოკალურად აღარ არსებობს
            const localIds = new Set(
                (data.cards || []) // თუ cards არაა, მაინც ცარიელ მასივს გავუშვებთ
                    .filter(c => c.firebaseId)
                    .map(c => c.firebaseId)
            );

            for (const docId of Object.keys(serverMap)) {
                if (!localIds.has(docId)) {
                    await deleteDoc(doc(db, "cards", docId));
                }
            }

            // 5. შევინახოთ ახალდანიშნული firebaseId-ები
            localStorage.setItem("english_cards_app", JSON.stringify(data));
        }
    </script>

    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet"/>
    <!-- Tagify CSS -->
    <link href="https://cdn.jsdelivr.net/npm/@yaireo/tagify/dist/tagify.css" rel="stylesheet"/>
    <!-- Font Awesome (latest version) -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js">
    </script>
    <script src="https://cdn.jsdelivr.net/npm/@yaireo/tagify">
    </script>
</head>
<body>
<div class="top">
    <div class="top-bar">
        <div class="top-left">
            <h1 class="title">
                English Words
            </h1>
        </div>
        <div class="top-center">
            <button id="tagLibraryBtn">
                <i class="fas fa-tags">
                </i>
                თეგები
            </button>
            <!-- Training Button -->
            <button id="trainingBtn">
                <i class="fas fa-tags">
                </i>
                ტრენინგი
            </button>
            <div class="input-container search-input">
                <label class="material-input">
                    <input class="form-control" id="searchInput" placeholder=" " type="text"/>
                    <span>
        ძიება
       </span>
                    <i class="fas fa-search" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: #aaa;">
                    </i>
                </label>
            </div>


        </div>
        <div class="top-right">
            <button class="toolbar-btn" id="pullFromFirestoreBtn">Sync</button>


            <button class="toolbar-btn" id="syncAllBtn">Publish</button>
            <button id="toggleDarkModeBtn" title="Dark Mode Toggle">
                <i class="fas fa-moon">
                </i>
            </button>
            <button id="settingsBtn">
                <i class="fas fa-cog">
                </i>
            </button>
        </div>
    </div>
    <!-- toolbar ბლოკი -->
    <div class="card-toolbar" id="cardToolbar">
        <div class="toolbar-left">
            <button id="toggleSidebarBtn">
                <i class="fas fa-tags">
                </i>
            </button>
            <div class="sorting">
                <i class="fas fa-sort-down" id="sortDirectionIcon">
                </i>
                <label class="sort-label" for="sortSelect">
                </label>
                <select class="toolbar-select" id="sortSelect">
                    <option value="alphabetical">
                        ანბანური
                    </option>
                    <option value="updated">
                        ბოლო
                    </option>
                    <option selected="" value="progress">
                        პროგრესით
                    </option>
                </select>
            </div>
            <div class="hide-mastered-wrapper">
                <label style="display: flex; align-items: center; gap: 5px;">
                    <input id="hideMasteredCheckbox" type="checkbox"/>
                    <span>
        - ნასწავლი
       </span>
                </label>
            </div>
        </div>
        <div class="toolbar-center">
        </div>
        <div class="toolbar-right">
            <button id="notificationsBtn" class="toolbar-btn"><i class="fa-regular fa-bell"></i></button>


            <button class="toolbar-btn" id="statsBtn" title="სტატისტიკა">
                <i class="fas fa-chart-pie">
                </i>
                სტატისტიკა
            </button>
        </div>
    </div>
</div>
<div class="card-container" id="cardContainer">
    <!-- დინამიური ქარდები ჩნდება აქ -->
</div>
<!-- მოდალი -->
<div class="modal-overlay" id="modalOverlay">
    <div class="modal">
        <div class="modal-actions close-modal">
            <button class="close-button" id="closeAddModalBtn">
                ×
            </button>
        </div>
        <h2>
            ახალი სიტყვა
        </h2>
        <div class="input-container">
            <label class="material-input validation">
                <input class="form-control" id="wordInput" placeholder=" " required="" type="text" value="(ვალიდაცია)"/>
                <span>
       საწყისი სიტყვა
      </span>
            </label>
        </div>
        <div class="input-container tag-input">
            <label class="material-input">
                <input id="mainTranslationInput" placeholder=" " type="text"/>
                <span>
       მთავარი თარგმანი
      </span>
            </label>
            <button id="addMainTranslationBtn">
                +
            </button>
        </div>
        <div class="tags-display" id="mainTranslationTags">
        </div>
        <div class="input-container tag-input">
            <label class="material-input">
                <input id="extraTranslationInput" placeholder=" " type="text"/>
                <span>
       დამატებითები თარგმანი
      </span>
            </label>
            <button id="addExtraTranslationBtn">
                +
            </button>
        </div>
        <div class="tags-display" id="extraTranslationTags">
        </div>
        <div class="input-container tag-input">
            <label class="material-input">
                <input id="tagInput" placeholder=" " type="text"/>
                <span>
       ჩაწერე ან აარჩიე თეგი
      </span>
            </label>
            <button id="addTagBtn">
                +
            </button>
            <div class="dropdown" id="tagDropdown">
            </div>
        </div>
        <div class="tags-display" id="tagList">
        </div>
        <div class="input-container">
            <label class="material-input">
                <textarea class="form-control" id="englishSentences" placeholder=" " rows="6"></textarea>
                <span>
       ინგლისური წინადაებები
      </span>
            </label>
        </div>
        <div class="input-container">
            <label class="material-input">
                <textarea class="form-control" id="georgianSentences" placeholder=" " rows="5"></textarea>
                <span>
       ქართული წინადაებები
      </span>
            </label>
        </div>
        <div class="modal-actions">
            <button id="saveCardBtn">
                შენახვა
            </button>
            <button id="cancelBtn">
                გაუქმება
            </button>
        </div>
    </div>
</div>
<div class="modal-overlay" id="tagLibraryModal" style="display:none;">
    <div class="modal tag-library-modal">
        <div class="modal-actions close-modal" id="closeTagLibraryBtn">
            <button class="close-button" id="closeTagLibraryXBtn">
                ×
            </button>
        </div>
        <h2>
            თეგების ბიბლიოთეკა
        </h2>
        <!-- ✅ პირველად გამოჩნდება -->
        <div class="tag-library-footer">
            <div class="input-container">
                <label class="material-input">
                    <input class="form-control" id="newTagInput" placeholder=" " type="text">
                    <span>
         ახალი თეგი
        </span>
                    </input>
                </label>
            </div>
            <button id="addNewTagBtn">
                <i class="fas fa-plus">
                </i>
                დამატება
            </button>
        </div>
        <ul class="tag-list-container" id="tagListContainer">
        </ul>
    </div>
</div>
<button class="mobile-sidebar-btn" id="mobileSidebarBtn">
    <i class="fas fa-filter">
    </i>
</button>
<div class="sidebar" id="sidebar">
    <div class="tags-header">
        <button id="closeSidebarBtn" style="float:right;">
            ✖
        </button>
        <h3>
            თეგები
        </h3>
        <button class="clear-tags-btn" id="clearTagFiltersBtn">
            ✖ ფილტრის გასუფთავება
        </button>
    </div>
    <ul id="sidebarTagList">
    </ul>
</div>
<div class="modal-overlay" id="cardPreviewModal" style="display: none;">
    <!-- გადატანილი ღილაკები მოდალის შიგნით -->
    <button class="nav-btn inside-nav left-nav fas fa-angle-left" id="prevCardBtn">
    </button>
    <button class="nav-btn inside-nav right-nav fas fa-angle-right" id="nextCardBtn">
    </button>
    <div class="modal preview-modal">
        <div class="modal-actions close-modal">
            <button class="close-button" id="closePreviewBtn">
                ×
            </button>
        </div>
        <div class="preview-sticky">
            <h2 id="previewWord">
            </h2>
            <hr/>
            <p id="previewTranslation">
            </p>
            <div class="tags" id="previewTags">
            </div>
        </div>
        <div class="modal-section sentence-preview">
            <h3>
                ინგლისური
            </h3>
            <div class="sentence-list" id="previewEnglishSentences">
            </div>
            <h3>
                ქართული
            </h3>
            <div class="sentence-list" id="previewGeorgianSentences">
            </div>
        </div>
    </div>
</div>
<div class="modal-overlay" id="settingsModal" style="display: none; gap: 10px; flex-wrap: wrap;">
    <div class="modal" style="max-width: 500px;">
        <div class="modal-actions close-modal">
            <button class="close-button" id="closeSettingsBtn">
                ×
            </button>
        </div>
        <h2>
            პარამეტრები
        </h2>
        <!-- 🔈 Voice არჩევა -->
        <div class="input-container">
            <label class="material-input material-select">
                <select id="voiceSelect" required="">
                    <option disabled="" hidden="" selected="" value="">
                    </option>
                    <option value="Libby">
                        Microsoft Libby Online
                    </option>
                    <option value="Maisie">
                        Microsoft Maisie Online
                    </option>
                    <option value="Ryan">
                        Microsoft Ryan Online
                    </option>
                    <option value="Sonia">
                        Microsoft Sonia Online
                    </option>
                    <option value="Thomas">
                        Microsoft Thomas Online
                    </option>
                    <option value="Ana">
                        Microsoft Ana Online
                    </option>
                </select>
                <span>
       აირჩიე ინგლისური ხმა
      </span>
                <i class="fas fa-chevron-down select-arrow-icon">
                </i>
            </label>
        </div>
        <!-- ინგლისურის სიჩქარის კონტროლი -->
        <div>
            <label class="material-input">
      <span>
       ინგლისური ხმის სიჩქარე
      </span>
                <input id="englishRateSlider" max="2" min="0.5" step="0.1" type="range" value="1"/>
            </label>
        </div>
        <!-- 🔈 Georgian Voice არჩევა -->
        <div class="input-container">
            <label class="material-input material-select">
                <select id="georgianVoiceSelect" required="">
                    <option disabled="" hidden="" selected="" value="">
                    </option>
                    <option value="Microsoft Eka Online (Natural)">
                        Microsoft Eka Online (Natural) - Georgian (Georgia)
                    </option>
                    <option value="Microsoft Giorgi Online (Natural)">
                        Microsoft Giorgi Online (Natural) - Georgian (Georgia)
                    </option>
                </select>
                <span>
       აირჩიე ქართული ხმა
      </span>
                <i class="fas fa-chevron-down select-arrow-icon">
                </i>
            </label>
        </div>
        <!-- ქართული ხმის სიჩქარის კონტროლი -->
        <div>
            <label class="material-input">
      <span>
       ქართული ხმის სიჩქარე
      </span>
                <input id="georgianRateSlider" max="2" min="0.5" step="0.1" type="range" value="1"/>
            </label>
        </div>
        <div class="import-export-group">
            <h3>
                ფაილების იმპორტი / ექსპორტი
            </h3>
            <div class="button-row">
                <button class="settings-btn blue" id="exportExcelBtn">
                    📤 ექსპორტი Excel-ში
                </button>
                <label class="settings-btn settings-btn-force cyan" for="importExcelInput">
                    📥 იმპორტი Excel-დან
                </label>
                <input accept=".xlsx" id="importExcelInput" style="display: none;" type="file">
                <button class="settings-btn gray" id="downloadTemplateBtn">
                    🧾 ჩამოტვირთე შაბლონი
                </button>
                </input>




            </div>
        </div>
        <div class="modal-actions" style="margin-top: 20px;">
            <button id="saveVoiceBtn" style="background-color: #28a745; color: white;">
                შენახვა
            </button>
        </div>
    </div>
</div>
<!-- Training Modal -->
<div class="training-modal hidden" id="trainingModal">
    <div class="training-modal-content">
        <div class="training-wrapper">
            <div class="training-tabs">
                <button class="training-tab active" data-tab="quiz">
                    QUIZ
                </button>
                <button class="training-tab" data-tab="tab2">
                    HEAR
                </button>
                <button class="training-tab" data-tab="tab3">
                    MIX
                </button>
                <button class="training-tab" data-tab="tab4">
                    FILL
                </button>
                <button class="training-tab" data-tab="tab5">
                    TYPE
                </button>
                <button class="training-tab" data-tab="tab6">
                    SENTENCE
                </button>
                <button class="training-tab" data-tab="tab7">
                    PUZZLE
                </button>
                <button class="training-close">
                    ×
                </button>
            </div>
            <div id="globalTrainingSettings">
                <div class="tag-filter">
                    <label for="globalTagSelect">
                        თეგი:
                    </label>
                    <select id="globalTagSelect">
                    </select>
                </div>
                <div class="count-filter">
                    <label for="globalQuestionCount">
                        რაოდენობა:
                    </label>
                    <input id="globalQuestionCount" max="100" min="1" type="number" value="10"/>
                </div>
                <label>
                    <input id="globalReverseToggle" type="checkbox"/>
                    რევერსი
                </label>
                <label>
                    <input id="globalHideMastered" type="checkbox"/>
                    - ნასწავლი
                </label>
            </div>
        </div>
        <div class="training-tab-content" data-tab-content="quiz" id="quizTab">
            <h2>
                Quiz სექცია
            </h2>
            <div class="quiz-settings">
            </div>
            <div class="quiz-container" id="quizContainer">
                <!-- აქ ჩნდება ტესტის ინტერფეისი -->
            </div>
        </div>
        <div class="training-tab-content hidden" data-tab-content="tab2">
            <h2>
                ტაბი 2 შინაარსი
            </h2>
        </div>
        <div class="training-tab-content hidden" data-tab-content="tab3">
            <h2>
                ტაბი 3 შინაარსი
            </h2>
        </div>
        <div class="training-tab-content hidden" data-tab-content="tab4">
            <h2>
                ტაბი 4 შინაარსი
            </h2>
        </div>
        <div class="training-tab-content hidden" data-tab-content="tab5">
            <h2>
                ტაბი 5 შინაარსი
            </h2>
        </div>
        <div class="training-tab-content hidden" data-tab-content="tab6">
        </div>
        <div class="training-tab-content hidden" data-tab-content="tab7">
        </div>
    </div>
</div>
<div class="fixed-player-wrapper">
    <div class="player">
        <button class="toolbar-btn" title="Previous">
            <i class="fas fa-backward-step">
            </i>
        </button>
        <button class="toolbar-btn" title="Play">
            <i class="fas fa-play">
            </i>
        </button>
        <button class="toolbar-btn" title="Stop">
            <i class="fas fa-stop">
            </i>
        </button>
        <button class="toolbar-btn" title="Next">
            <i class="fas fa-forward-step">
            </i>
        </button>
        <button class="toolbar-btn" id="shuffleCardBtn" title="Shuffle">
            <i class="fas fa-shuffle">
            </i>
        </button>
    </div>
</div>
<button class="mobile-toggle-btn" id="showTopBtn">
    <i class="fas fa-sliders">
    </i>
</button>
<button class="add-card-btn" id="addCardBtn">
    <i class="fas fa-plus">
    </i>
</button>
<div class="toolbar-actions">
    <button id="deleteSelectedBtn">
        <i class="fas fa-trash">
        </i>
        წაშლა
    </button>
    <button id="selectAllBtn">
        <i class="fa-solid fa-check-double">
        </i>
    </button>
    <button id="cancelSelectionBtn">
        <i class="fas fa-xmark">
        </i>
    </button>
</div>
<!-- სტატისტიკის მოდალი -->
<div class="modal-overlay" id="statsModal" style="display:none;">
    <div class="modal" style="max-width:400px;">
        <div class="modal-actions close-modal">
            <button class="close-button" id="closeStatsBtn">
                ×
            </button>
        </div>
        <h2>
            სტატისტიკა
        </h2>
        <div id="statsContent">
            <!-- აქ შეავსებს JS-ი ჯამურ მონაცემებს -->
            <p>
                სიტყვების საერთო რაოდენობა:
                <span id="statsTotalWords">
       0
      </span>
            </p>
            <p>
                ნასწავლი სიტყვები:
                <span id="statsMastered">
       0
      </span>
                <span id="statsTotal2">
       0
      </span>
            </p>
            <p>
                საშუალო პროგრესი:
                <span id="statsAvgProgress">
       0
      </span>
            </p>
            <p>
                გავლილი ტესტირება (სულ):
                <span id="statsTests">
       0
      </span>
            </p>
            <p>
                სწორი vs არასწორი:
                <span id="statsCorrectWrong">
       0 - 0 (0% - 0%)
      </span>
            </p>
            <button id="resetStatsBtn" style="margin-top: 20px; background-color: crimson; color: white; padding: 10px 16px; border: none; border-radius: 8px; cursor: pointer;">
                <i class="fa-solid fa-broom">
                </i>
                გასუფთავება
            </button>
        </div>
    </div>
</div>


<div class="modal-overlay" id="notificationsModal" style="display:none;">
    <div class="modal" style="max-width: 500px;">
        <div class="modal-actions close-modal">
            <button class="close-button" id="closeNotificationsBtn">×</button>
        </div>
        <h2>შეტყობინებები</h2>

        <div class="input-container">
            <label class="material-input">
                <input type="time" id="reminderTimeInput" required>
                <span>შეიყვანე დრო</span>
            </label>
        </div>

        <div class="weekday-checkboxes" style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 10px;">
            <label><input type="checkbox" value="1"> ორშ.</label>
            <label><input type="checkbox" value="2"> სამშ.</label>
            <label><input type="checkbox" value="3"> ოთხშ.</label>
            <label><input type="checkbox" value="4"> ხუთშ.</label>
            <label><input type="checkbox" value="5"> პარ.</label>
            <label><input type="checkbox" value="6"> შაბ.</label>
            <label><input type="checkbox" value="0"> კვ.</label>

        </div>


        <div class="input-container">
            <label class="material-input material-select">
                <select id="notificationTagFilter">
                    <option value="">ყველა თეგი</option>
                    <!-- დინამიურად დაემატება -->
                </select>
                <span>აირჩიე თეგი</span>
                <i class="fas fa-chevron-down select-arrow-icon"></i>
            </label>
        </div>

        <label style="display: flex; align-items: center; justify-content: center; width: 40%; height: 30px; margin: 0 auto; cursor: pointer">


            <input style="width: auto; margin-right: 10px" type="checkbox" id="excludeMasteredCheckbox" />
            - ნასწავლი
        </label>

        <button id="addReminderBtn" style="margin-bottom: 15px;">➕ დამატება</button>

        <ul id="reminderList"></ul>



    </div>
</div>

<h2 class="mobile-tittle">Worded</h2>

</body>
</html>
