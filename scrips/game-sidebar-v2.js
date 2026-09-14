// Game Sidebar - games.html sidebar + Favorites & Recently Played sections
(function() {
    var baseUrl = window.location.origin;

    // Inject sidebar CSS
    var cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://raw.githubusercontent.com/schoolind/games1/refs/heads/main/scrips/style.css';
    document.head.appendChild(cssLink);

    // Inject extra styles for favorites/recently played in sidebar
    var extraStyle = document.createElement('style');
    extraStyle.textContent = '.sidebar-fav-grid{display:flex;flex-wrap:wrap;gap:8px}.sidebar-fav-item{width:calc((100% - 16px)/3);aspect-ratio:1;border-radius:8px;overflow:hidden;text-decoration:none;transition:transform .2s}.sidebar-fav-item:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(79,195,247,.3)}.sidebar-fav-item img{width:100%;height:100%;object-fit:cover;display:block}.sidebar-empty{color:rgba(255,255,255,.5);font-style:italic;font-size:.85em;padding:10px 0}';
    document.head.appendChild(extraStyle);

    // Inject Font Awesome if not already loaded
    if (!document.querySelector('link[href*="font-awesome"]')) {
        var faLink = document.createElement('link');
        faLink.rel = 'stylesheet';
        faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
        document.head.appendChild(faLink);
    }

    // Sidebar HTML — games.html sidebar + Favorites + Recently Played
    var sidebarHTML = '<button class="sidebar-toggle" id="sidebarToggle"><i class="fas fa-bars"></i></button><div class="sidebar" id="sidebar"><h2>Menu</h2><div class="search-box"><input type="text" id="searchInput" placeholder="Search games..." oninput="searchGames()"><i class="fas fa-search"></i></div><div class="sidebar-fav-grid" id="sidebarSearchResults" style="display:none"></div><h3 style="color:#FFD700;margin-top:15px"><i class="fas fa-star" style="margin-right:8px"></i>Favorites</h3><div class="sidebar-fav-grid" id="sidebarFavorites"></div><h3 style="color:#4fc3f7;margin-top:15px"><i class="fas fa-clock" style="margin-right:8px"></i>Recently Played</h3><div class="sidebar-fav-grid" id="sidebarRecent"></div><div style="margin-top: auto; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px; display: flex; justify-content: space-between; align-items: center;"><a href="' + baseUrl + '/home.html" style="display: inline-block; color: #888 !important; text-decoration: none !important; padding: 5px !important; margin: 0 !important; border-radius: 0 !important; background: none !important; transition: color 0.2s;" onmouseover="this.style.color=\'#ccc\'" onmouseout="this.style.color=\'#888\'"><i class="fas fa-home" style="color: inherit;"></i></a><a href="' + baseUrl + '/games.html" style="display: inline-block; color: #888 !important; text-decoration: none !important; padding: 5px !important; margin: 0 !important; border-radius: 0 !important; background: none !important; transition: color 0.2s;" onmouseover="this.style.color=\'#ccc\'" onmouseout="this.style.color=\'#888\'"><i class="fas fa-gamepad" style="color: inherit;"></i></a><a href="' + baseUrl + '/settings.html" style="display: inline-block; color: #888 !important; text-decoration: none !important; padding: 5px !important; margin: 0 !important; border-radius: 0 !important; background: none !important; transition: color 0.2s;" onmouseover="this.style.color=\'#ccc\'" onmouseout="this.style.color=\'#888\'"><i class="fas fa-cog" style="color: inherit;"></i></a></div></div>';

    // Game list — fetched dynamically from games.html
    var games = [];
    var gameLookup = {};

    function loadGamesFromPage(callback) {
        fetch(baseUrl + '/games.html')
            .then(function(res) { return res.text(); })
            .then(function(html) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');
                var gameLinks = doc.querySelectorAll('#games a');
                gameLinks.forEach(function(a) {
                    var path = a.getAttribute('href');
                    var img = a.querySelector('img');
                    var name = img ? img.getAttribute('alt') : path;
                    var imgSrc = img ? img.getAttribute('src') : '';
                    var game = { path: path, name: name, img: imgSrc };
                    games.push(game);
                    gameLookup[path] = game;
                });
                if (callback) callback();
            })
            .catch(function() {
                if (callback) callback();
            });
    }

    function populateFavorites() {
        var container = document.getElementById('sidebarFavorites');
        if (!container) return;
        var favorites = JSON.parse(localStorage.getItem('gameFavorites') || '[]');
        if (favorites.length === 0) {
            container.innerHTML = '<div class="sidebar-empty">No favorites yet</div>';
            return;
        }
        favorites.forEach(function(fav) {
            var gameData = gameLookup[fav.path] || fav;
            var link = document.createElement('a');
            link.href = baseUrl + '/' + fav.path;
            link.className = 'sidebar-fav-item';
            link.title = fav.name;
            var img = document.createElement('img');
            img.src = gameData.img || fav.img;
            img.alt = fav.name;
            link.appendChild(img);
            container.appendChild(link);
        });
    }

    function populateRecentlyPlayed() {
        var container = document.getElementById('sidebarRecent');
        if (!container) return;
        var recentlyPlayed = [];
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key && key.indexOf('game_') === 0 && key.indexOf('_lastPlayed') === key.length - 11) {
                var gameSlug = key.replace('game_', '').replace('_lastPlayed', '');
                var lastPlayed = localStorage.getItem(key);
                var gameData = null;
                for (var path in gameLookup) {
                    var g = gameLookup[path];
                    var normalizedPath = path.toLowerCase().replace(/[^a-z0-9]/g, '');
                    var normalizedName = g.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                    if (normalizedPath.indexOf(gameSlug) !== -1 || normalizedName.indexOf(gameSlug) !== -1 || gameSlug.indexOf(normalizedPath) !== -1) { gameData = g; break; }
                }
                if (gameData) {
                    recentlyPlayed.push({ name: gameData.name, path: gameData.path, img: gameData.img, lastPlayed: new Date(lastPlayed) });
                }
            }
        }
        recentlyPlayed.sort(function(a, b) { return b.lastPlayed - a.lastPlayed; });
        var displayGames = recentlyPlayed.slice(0, 12);
        if (displayGames.length === 0) {
            container.innerHTML = '<div class="sidebar-empty">No recently played games</div>';
            return;
        }
        displayGames.forEach(function(game) {
            var link = document.createElement('a');
            link.href = baseUrl + '/' + game.path;
            link.className = 'sidebar-fav-item';
            link.title = game.name;
            var img = document.createElement('img');
            img.src = game.img;
            img.alt = game.name;
            link.appendChild(img);
            container.appendChild(link);
        });
    }

    function insertSidebar() {
        if (!document.body) { setTimeout(insertSidebar, 10); return; }

        var hasIframe = document.querySelector('iframe') || document.querySelector('canvas') || document.querySelector('#gameContainer');

        if (hasIframe) {
            document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
        } else {
            var contentDiv = document.createElement('div');
            contentDiv.className = 'content';
            while (document.body.firstChild) { contentDiv.appendChild(document.body.firstChild); }
            document.body.appendChild(contentDiv);
            contentDiv.insertAdjacentHTML('afterbegin', sidebarHTML);
        }

        var sidebar = document.getElementById('sidebar');
        var sidebarToggle = document.getElementById('sidebarToggle');
        if (!sidebar || !sidebarToggle) return;

        sidebarToggle.addEventListener('click', function(event) {
            event.stopPropagation();
            sidebar.classList.toggle('active');
            if (!hasIframe) {
                var contentEl = document.querySelector('.content');
                if (contentEl) contentEl.classList.toggle('shifted');
            }
            var icon = this.querySelector('i');
            if (sidebar.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        document.addEventListener('click', function(event) {
            if (!sidebar.contains(event.target) && !sidebarToggle.contains(event.target) && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                if (!hasIframe) {
                    var contentEl = document.querySelector('.content');
                    if (contentEl) contentEl.classList.remove('shifted');
                }
                var icon = sidebarToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Search function
        window.searchGames = function() {
            var searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
            var resultsContainer = document.getElementById('sidebarSearchResults');
            var favSection = document.getElementById('sidebarFavorites');
            var recentSection = document.getElementById('sidebarRecent');
            var favHeading = favSection ? favSection.previousElementSibling : null;
            var recentHeading = recentSection ? recentSection.previousElementSibling : null;

            if (searchTerm === '') {
                resultsContainer.style.display = 'none';
                resultsContainer.innerHTML = '';
                if (favSection) favSection.style.display = '';
                if (recentSection) recentSection.style.display = '';
                if (favHeading) favHeading.style.display = '';
                if (recentHeading) recentHeading.style.display = '';
                return;
            }

            var matched = games.filter(function(g) {
                return g.name.toLowerCase().indexOf(searchTerm) !== -1;
            });

            if (matched.length === 0) {
                resultsContainer.innerHTML = '<div class="sidebar-empty">No games found</div>';
            } else {
                resultsContainer.innerHTML = '';
                matched.forEach(function(g) {
                    var link = document.createElement('a');
                    link.href = baseUrl + '/' + g.path;
                    link.className = 'sidebar-fav-item';
                    link.title = g.name;
                    var img = document.createElement('img');
                    img.src = g.img;
                    img.alt = g.name;
                    link.appendChild(img);
                    resultsContainer.appendChild(link);
                });
            }

            resultsContainer.style.display = 'flex';
            if (favSection) favSection.style.display = 'none';
            if (recentSection) recentSection.style.display = 'none';
            if (favHeading) favHeading.style.display = 'none';
            if (recentHeading) recentHeading.style.display = 'none';
        };

        loadGamesFromPage(function() {
            populateFavorites();
            populateRecentlyPlayed();
        });
    }

    insertSidebar();
})();
