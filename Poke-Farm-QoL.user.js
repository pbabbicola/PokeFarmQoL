// ==UserScript==
// @name         Poké Farm QoL
// @namespace    https://github.com/jpgualdarrama/
// @author       Bentomon
// @homepage     https://github.com/jpgualdarrama/PokeFarmQoL
// @downloadURL  https://github.com/jpgualdarrama/PokeFarmQoL/raw/issue_11/Poke-Farm-QoL.user.js
// @description  Quality of Life changes to Pokéfarm!
// @version      1.3.61
// @match        https://pokefarm.com/*
// @require      http://code.jquery.com/jquery-3.3.1.min.js
// @require      https://raw.githubusercontent.com/lodash/lodash/4.17.4/dist/lodash.min.js
// @require      https://cdn.rawgit.com/omichelsen/compare-versions/v3.1.0/index.js
// @resource     QolHubHTML            https://raw.githubusercontent.com/jpgualdarrama/PokeFarmQoL/issue_11/resources/templates/qolHubHTML.html
// @resource     shelterSettingsHTML    https://raw.githubusercontent.com/jpgualdarrama/PokeFarmQoL/issue_11/resources/templates/shelterOptionsHTML.html
// @resource     evolveFastHTML         https://raw.githubusercontent.com/jpgualdarrama/PokeFarmQoL/issue_11/resources/templates/evolveFastHTML.html
// @resource     labOptionsHTML         https://raw.githubusercontent.com/jpgualdarrama/PokeFarmQoL/issue_11/resources/templates/labOptionsHTML.html
// @resource     fieldSortHTML        https://raw.githubusercontent.com/jpgualdarrama/PokeFarmQoL/issue_11/resources/templates/fieldSortHTML.html
// @resource     fieldSearchHTML        https://raw.githubusercontent.com/jpgualdarrama/PokeFarmQoL/issue_11/resources/templates/fieldSearchHTML.html
// @resource     privateFieldSearchHTML        https://raw.githubusercontent.com/jpgualdarrama/PokeFarmQoL/issue_11/resources/templates/privateFieldSearchHTML.html
// @resource     QoLCSS                 https://raw.githubusercontent.com/jpgualdarrama/PokeFarmQoL/issue_11/resources/css/pfqol.css
// @require      https://raw.githubusercontent.com/jpgualdarrama/PokeFarmQoL/issue_11/requires/helpers.js
// @require      https://raw.githubusercontent.com/jpgualdarrama/PokeFarmQoL/issue_11/requires/dexUtilities.js
// @require      https://raw.githubusercontent.com/jpgualdarrama/PokeFarmQoL/issue_11/requires/globals.js
// @require      https://raw.githubusercontent.com/jpgualdarrama/PokeFarmQoL/issue_11/requires/basePage.js
// @require      https://raw.githubusercontent.com/jpgualdarrama/PokeFarmQoL/issue_11/requires/shelterPage.js
// @require      https://raw.githubusercontent.com/jpgualdarrama/PokeFarmQoL/issue_11/requires/privateFieldsPage.js
// @require      https://raw.githubusercontent.com/jpgualdarrama/PokeFarmQoL/issue_11/requires/publicFieldsPage.js
// @require      https://raw.githubusercontent.com/jpgualdarrama/PokeFarmQoL/issue_11/requires/labPage.js
// @require      https://raw.githubusercontent.com/jpgualdarrama/PokeFarmQoL/issue_11/requires/fishingPage.js
// @require      https://raw.githubusercontent.com/jpgualdarrama/PokeFarmQoL/issue_11/requires/multiuserPage.js
// @require      https://raw.githubusercontent.com/jpgualdarrama/PokeFarmQoL/issue_11/requires/farmPage.js
// @require      https://raw.githubusercontent.com/jpgualdarrama/PokeFarmQoL/issue_11/requires/daycarePage.js
// @require      https://raw.githubusercontent.com/jpgualdarrama/PokeFarmQoL/issue_11/requires/dexPage.js
// @updateURL    https://github.com/jpgualdarrama/PokeFarmQoL/raw/issue_11/Poke-Farm-QoL.user.js
// @connect      github.com
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_info
// ==/UserScript==

(function($) {
    'use strict';
    // :contains to case insensitive
    $.extend($.expr[":"], {
        "containsIN": function(elem, i, match, array) {
            return (elem.textContent || elem.innerText || "").toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
        }
    });

    let PFQoL = (function PFQoL() {

        const DEFAULT_USER_SETTINGS = { // default settings when the script gets loaded the first time
            //variables
            customCss: "",
            enableDaycare: true,
            shelterEnable: true,
            fishingEnable: true,
            publicFieldEnable: true,
            privateFieldEnable: true,
            partyMod: true,
            easyEvolve: true,
            labNotifier: true,
            dexFilterEnable: true
        };

        const SETTINGS_SAVE_KEY = GLOBALS.SETTINGS_SAVE_KEY;

        const VARIABLES = { // all the variables that are going to be used in fn
            userSettings : DEFAULT_USER_SETTINGS,
            shelterTypeSearch : GLOBALS.SHELTER_TYPE_TABLE,
            natureList : GLOBALS.NATURE_LIST,
            shelterSearch : GLOBALS.SHELTER_SEARCH_DATA,
        }

        const PAGES = {
            'Daycare': [daycarePage, 'enableDaycare'],
            'Farm' : [farmPage, 'easyEvolve'],
            'Fishing' : [fishingPage, 'fishingEnable'],
            'Lab' : [labPage, 'labNotifier'],
            'Multiuser' : [multiuserPage, 'partyMod'],
            'PrivateFields' : [privateFieldsPage, 'privateFieldEnable'],
            'PublicFields' : [publicFieldsPage, 'publicFieldEnable'],
            'Shelter' : [shelterPage, 'shelterEnable'],
            'Dex': [dexPage, 'dexFilterEnable']
        }
        const PAGE_OBJ_INDEX = 0;
        const PAGE_VAR_INDEX = 1;

        const fn = { // all the functions for the script
            /** background stuff */
            backwork : { // backgrounds stuff
                checkForUpdate() {
                    let version ="";
                    GM_xmlhttpRequest({
                        method: 'GET',
                        url: 'https://api.github.com/repos/jpgualdarrama/PokeFarmQoL/contents/Poke-Farm-QoL.user.js',
                        responseType: 'json',
                        onload: function(data) {
                            let match = atob(data.response.content).match(/\/\/\s+@version\s+([^\n]+)/);
                            version = match[1];
                            if (compareVersions(GM_info.script.version, version) < 0) {
                                document.querySelector("li[data-name*='QoL']").insertAdjacentHTML('afterend', TEMPLATES.qolHubUpdateLinkHTML);
                            }
                        }
                    });
                },
                loadSettings() { // initial settings on first run and setting the variable settings key
                    for(const key of Object.keys(PAGES)) {
                        let pg = PAGES[key]
                        if(VARIABLES.userSettings[pg[PAGE_VAR_INDEX]] === true && pg[PAGE_OBJ_INDEX].onPage(window)) {
                            pg[PAGE_OBJ_INDEX].loadSettings();
                        }
                    }
                    if (localStorage.getItem(SETTINGS_SAVE_KEY) === null) {
                        fn.backwork.saveSettings();
                    } else {
                        try {
                            let countScriptSettings = Object.keys(VARIABLES.userSettings).length;
                            let localStorageString = JSON.parse(localStorage.getItem(SETTINGS_SAVE_KEY));
                            let countLocalStorageSettings = Object.keys(localStorageString).length;
                            // adds new objects (settings) to the local storage
                            if (countLocalStorageSettings < countScriptSettings) {
                                let defaultsSetting = VARIABLES.userSettings;
                                let userSetting = JSON.parse(localStorage.getItem(SETTINGS_SAVE_KEY));
                                let newSetting = $.extend(true,{}, defaultsSetting, userSetting);

                                VARIABLES.userSettings = newSetting;
                                fn.backwork.saveSettings();
                            }
                            // removes objects from the local storage if they don't exist anymore. Not yet possible..
                            if (countLocalStorageSettings > countScriptSettings) {
                                //let defaultsSetting = VARIABLES.userSettings;
                                //let userSetting = JSON.parse(localStorage.getItem(SETTINGS_SAVE_KEY));
                                fn.backwork.saveSettings();
                            }
                        }
                        catch(err) {
                            fn.backwork.saveSettings();
                        }
                        if (localStorage.getItem(SETTINGS_SAVE_KEY) != VARIABLES.userSettings) {
                            VARIABLES.userSettings = JSON.parse(localStorage.getItem(SETTINGS_SAVE_KEY));
                        }
                    }
                }, // loadSettings
                saveSettings() { // Save changed settings
                    for(const key of Object.keys(PAGES)) {
                        let pg = PAGES[key]
                        if(VARIABLES.userSettings[pg[PAGE_VAR_INDEX]] === true && pg[PAGE_OBJ_INDEX].onPage(window)) {
                            pg[PAGE_OBJ_INDEX].saveSettings();
                        }
                    }
                    localStorage.setItem(SETTINGS_SAVE_KEY, JSON.stringify(VARIABLES.userSettings));
                }, // saveSettings
                populateSettingsPage() { // checks all settings checkboxes that are true in the settings
                    for (let key in VARIABLES.userSettings) {
                        if (!VARIABLES.userSettings.hasOwnProperty(key)) {
                            continue;
                        }
                        let value = VARIABLES.userSettings[key];
                        if (typeof value === 'boolean') {
                            Helpers.toggleSetting(key, value, false);
                            continue;
                        }
                        else if (typeof value === 'string') {
                            Helpers.toggleSetting(key, value, false);
                            continue;
                        }
                    }
                    for(const key of Object.keys(PAGES)) {
                        let pg = PAGES[key]
                        if(VARIABLES.userSettings[pg[PAGE_VAR_INDEX]] === true && pg[PAGE_OBJ_INDEX].onPage(window)) {
                            pg[PAGE_OBJ_INDEX].populateSettings();
                        }
                    }
                },
                clearPageSettings(pageName) {
                    if(! (pageName in PAGES) ) {
                        console.error(`Could not proceed with clearing page settings. Page ${pageName} not found in list of pages`)
                    } else {
                        PAGES[pageName][0].resetSettings();
                    }
                },
                setupHTML() { // injects the HTML changes from TEMPLATES into the site
                    // Header link to Userscript settings
                    document.querySelector("li[data-name*='Lucky Egg']").insertAdjacentHTML('afterend', TEMPLATES.qolHubLinkHTML);

                    for(const key of Object.keys(PAGES)) {
                        let pg = PAGES[key]
                        if(VARIABLES.userSettings[pg[PAGE_VAR_INDEX]] === true && pg[PAGE_OBJ_INDEX].onPage(window)) {
                            pg[PAGE_OBJ_INDEX].setupHTML();
                            fn.backwork.populateSettingsPage()
                        }
                    }
                },
                setupCSS() { // All the CSS changes are added here
                    GM_addStyle(GM_getResourceText('QoLCSS'));

                    for(const key of Object.keys(PAGES)) {
                        let pg = PAGES[key]
                        if(VARIABLES.userSettings[pg[PAGE_VAR_INDEX]] === true && pg[PAGE_OBJ_INDEX].onPage(window)) {
                            pg[PAGE_OBJ_INDEX].setupCSS();
                        }
                    }

                    //custom user css
                    let customUserCss = VARIABLES.userSettings.customCss;
                    let customUserCssInject = '<style type="text/css">'+customUserCss+'</style>'
                    //document.querySelector('head').append();
                    $('head').append('<style type="text/css">'+customUserCss+'</style>');
                },
                setupObservers() { // all the Observers that needs to run
                    for(const key of Object.keys(PAGES)) {
                        let pg = PAGES[key]
                        if(VARIABLES.userSettings[pg[PAGE_VAR_INDEX]] === true && pg[PAGE_OBJ_INDEX].onPage(window)) {
                            pg[PAGE_OBJ_INDEX].setupObserver();
                        }
                    }
                },
                setupHandlers() { // all the event handlers
                    for(const key of Object.keys(PAGES)) {
                        let pg = PAGES[key]
                        if(VARIABLES.userSettings[pg[PAGE_VAR_INDEX]] === true && pg[PAGE_OBJ_INDEX].onPage(window)) {
                            pg[PAGE_OBJ_INDEX].setupHandlers();
                        }
                    }

                    $(document).on('change', '.qolsetting', (function() {
                        fn.backwork.loadSettings();
                        fn.API.settingsChange(this.getAttribute('data-key'), $(this).val(), $(this).parent().parent().attr('class'), $(this).parent().attr('class'));
                        fn.backwork.saveSettings();
                    }));
                },
                startup() { // All the functions that are run to start the script on Pokéfarm
                    return {
                        'loading Settings'    : fn.backwork.loadSettings,
                        'checking for update' : fn.backwork.checkForUpdate,
                        'setting up HTML'     : fn.backwork.setupHTML,
                        'populating Settings' : fn.backwork.populateSettingsPage,
                        'setting up CSS'      : fn.backwork.setupCSS,
                        'setting up Observers': fn.backwork.setupObservers,
                        'setting up Handlers' : fn.backwork.setupHandlers,
                    }
                },
                init() { // Starts all the functions.
                    console.log('Starting up ..');
                    let startup = fn.backwork.startup();
                    for (let message in startup) {
                        if (!startup.hasOwnProperty(message)) {
                            continue;
                        }
                        console.log(message);
                        startup[message]();
                    }
                },
            }, // end of backwork

            /** public stuff */
            API : { // the actual seeable and interactable part of the userscript
                qolHubBuild() {
                    document.querySelector('body').insertAdjacentHTML('beforeend', TEMPLATES.qolHubHTML);
                    $('#core').addClass('scrolllock');
                    let qolHubCssBackgroundHead = $('.qolHubHead.qolHubSuperHead').css('background-color');
                    let qolHubCssTextColorHead = $('.qolHubHead.qolHubSuperHead').css('color');
                    let qolHubCssBackground = $('.qolHubTable').css('background-color');
                    let qolHubCssTextColor = $('.qolHubTable').css('color');
                    $('.qolHubHead').css({"backgroundColor":""+qolHubCssBackgroundHead+"","color":""+qolHubCssTextColorHead+""});
                    $('.qolChangeLogHead').css({"backgroundColor":""+qolHubCssBackgroundHead+"","color":""+qolHubCssTextColorHead+""});
                    $('.qolopencloselist.qolChangeLogContent').css({"backgroundColor":""+qolHubCssBackground+"","color":""+qolHubCssTextColor+""});
                    $('.qolDate').text(GLOBALS.DEX_UPDATE_DATE);

                    fn.backwork.populateSettingsPage();
                    let customCss = VARIABLES.userSettings.customCss;

                    $('.textareahub').append('<textarea id="qolcustomcss" rows="15" cols="60" class="qolsetting" data-key="customCss"/></textarea>');
                    if (VARIABLES.userSettings.customCss === "") {
                        $('.textareahub textarea').val(`#thisisanexample {\n    color: yellow;\n}\n\n.thisisalsoanexample {\n    background-color: blue!important;\n}\n\nhappycssing {\n    display: absolute;\n}`);
                    } else {
                        $('.textareahub textarea').val(customCss);
                    }

                    $('#qolcustomcss').on('keydown', function(e) {
                        if (e.keyCode == 9 || e.which == 9) {
                            e.preventDefault();
                            var s = this.selectionStart;
                            $(this).val(function(i, v) {
                                return v.substring(0, s) + "\t" + v.substring(this.selectionEnd)
                            });
                            this.selectionEnd = s + 1;
                        }
                    });

                },
                qolHubClose() {
                    $('.dialog').remove();
                    $('#core').removeClass('scrolllock');
                },

                settingsChange(element, textElement, customClass, typeClass) {
                    if (JSON.stringify(VARIABLES.userSettings).indexOf(element) >= 0) { // userscript settings
                        if (VARIABLES.userSettings[element] === false ) {
                            VARIABLES.userSettings[element] = true;
                        } else if (VARIABLES.userSettings[element] === true ) {
                            VARIABLES.userSettings[element] = false;
                        } else if (typeof VARIABLES.userSettings[element] === 'string') {
                            VARIABLES.userSettings[element] = textElement;
                        }
                        fn.backwork.saveSettings();
                    } else {
                        for(const key of Object.keys(PAGES)) {
                            let pg = PAGES[key]
                            if(VARIABLES.userSettings[pg[PAGE_VAR_INDEX]] === true && pg[PAGE_OBJ_INDEX].onPage(window)) {
                                pg[PAGE_OBJ_INDEX].settingsChange();
                            }
                        }
                    }
                },

                clearPageSettings(pageName) {
                    if(pageName !== "None") { // "None" matches option in HTML
                        fn.backwork.clearPageSettings(pageName)
                    }
                }
            }, // end of API
        }; // end of fn

        fn.backwork.init();

        return fn.API;
    })(); // end of PFQoL function

    $(document).on('click', 'li[data-name*="QoL"]', (function() { //open QoL hub
        PFQoL.qolHubBuild();
    }));

    $(document).on('click', '.closeHub', (function() { //close QoL hub
        PFQoL.qolHubClose();
    }));

    $(document).on('click', '#updateDex', (function() {
        // Manually update GLOBALS.DEX_DATA
        DexUtilities.loadDexIntoGlobalsFromWeb()

        // GLOBALS.DEX_DATA will contain the latest info as is read from local storage
        // this handler updates the local storage
        const progressSpan = $('span.qolDexUpdateProgress')[0]
        progressSpan.textContent = "Loading..."

        let date = (new Date()).toUTCString();
        GLOBALS.DEX_UPDATE_DATE = date;
        $('.qolDate').text(GLOBALS.DEX_UPDATE_DATE);
        DexUtilities.updateLocalStorageDex(date);

        // this will update the GLOBALS.EVOLVE_BY_LEVEL_LIST
        // and local storage
        DexUtilities.loadDexPage().then((data) => {
            let html = jQuery.parseHTML(data)
            let dex = $(html[10].querySelector('#dexdata')).html()
            let json = JSON.parse(dex)
            const dexNumbers = [];

            // load current list of processed dex IDs
            let dexIDsCache = []
            if(localStorage.getItem('QoLDexIDsCache') !== null) {
                dexIDsCache = JSON.parse(localStorage.getItem('QoLDexIDsCache'))
            }

            // get the list of pokedex numbers that haven't been processed before
            for(let r in json.regions) {
                for(let i = 0; i < json.regions[r].length; i++) {
                    if(dexIDsCache.indexOf(json.regions[r][i][0]) == -1) {
                        dexNumbers.push(json.regions[r][i][0])
                    }
                }
            }

            // Add the list of dexNumbers to the cache and write it back to local storage
            dexIDsCache = dexIDsCache.concat(dexNumbers)
            localStorage.setItem('QoLDexIDsCache', JSON.stringify(dexIDsCache))

            // load current evolve by level list
            let evolveByLevelList = {}
            if(localStorage.getItem('QoLEvolveByLevel') !== null) {
                evolveByLevelList = JSON.parse(localStorage.getItem('QoLEvolveByLevel'))
            }

            if(dexNumbers.length > 0) {
                // update the progress bar in the hub
                const limit = dexNumbers.length
                const progressBar = $('progress.qolDexUpdateProgress')[0]
                progressBar['max'] = limit

                // load and parse the evolution data for each
                DexUtilities.loadEvolutionTrees(dexNumbers, progressBar, progressSpan).then((...args) => {
                    let trees = args
                    // When pokemon have multiple forms, the dex page for only one of the forms will be loaded.
                    // The remaining forms can be discovered from the loaded data.
                    // This call will discover the forms and load the data for all pokemon and forms into args
                    DexUtilities.preprocessEvolutionData(dexNumbers, args, progressBar, progressSpan).then((...new_args) => {
                        let form_data = new_args
                        let form_map = {}
                        // join form data with dex data
                        for(let i = 0; i < form_data.length; i++) {
                            dexNumbers.push(form_data[i].number)
                            trees.push(form_data[i].data);
                            if(form_data[i].base in form_map) {
                                form_map[form_data[i].base].push({
                                    name: form_data[i].name,
                                    number: form_data[i].number
                                });
                            } else {
                                form_map[form_data[i].base] = [{
                                    name: form_data[i].name,
                                    number: form_data[i].number
                                }];
                            }
                        }

                        const parsed_families_and_dex_ids = DexUtilities.parseEvolutionTrees(trees)
                        const parsed_families = parsed_families_and_dex_ids[0]
                        const dex_ids = parsed_families_and_dex_ids[1]

                        // right now, only interested in pokemon that evolve by level
                        // so, this just builds a list of pokemon that evolve by level
                        let evolveByLevelList = {}
                        for(let pokemon in parsed_families) {
                            let evolutions = parsed_families[pokemon]
                            for(let i = 0; i < evolutions.length; i++) {
                                let evo = evolutions[i]
                                if(!(evo.source in evolveByLevelList) && Array.isArray(evo.condition)) {
                                    for(let j = 0; j < evo.condition.length; j++) {
                                        let cond = evo.condition[j]
                                        if(cond.condition === "Level") {
                                            evolveByLevelList[evo.source] = cond.condition + " " + cond.data
                                            evolveByLevelList[dex_ids[evo.source]] = cond.condition + " " + cond.data
                                        } // if
                                    } // for
                                } // if
                            } // for
                        } // for pokemon

                        GLOBALS.EVOLVE_BY_LEVEL_LIST = evolveByLevelList
                        localStorage.setItem('QoLEvolveByLevel', JSON.stringify(evolveByLevelList))

                        // store the maximum depth of the evolution tree for each pokemon
                        // for highlighting each pokemon based on how fully evolved they are
                        // https://github.com/jpgualdarrama/PokeFarmQoL/issues/11
                        let maxEvoTreeDepth = {}
                        for(let pokemon in parsed_families) {
                            let evolutions = parsed_families[pokemon]

                            if(pokemon === "Rotom") {
                                console.log('break')
                            }

                            // handle Mega and Totem formes separately, since they don't count
                            // towards actual evolutions
                            // 1. Filter out mega/totem evolutions
                            // 2. Add mega/totem forms to tree
                            for(let i = evolutions.length - 1; i>= 0; i--) {
                                if(evolutions[i].target.includes("Mega Forme") ||
                                   evolutions[i].target.includes("Totem Forme")) {
                                    evolutions.splice(i, 1);
                                }
                            }
                            if(pokemon.includes("Mega Forme") || pokemon.includes("Totem Forme")) {
                                maxEvoTreeDepth[pokemon] = {'remaining': 0, 'total': 0}
                            }

                            if(evolutions.length) {
                                let sources_list = evolutions.map( (el) => { return el.source } )

                                // don't redo the processing if the root of the tree is already in the list
                                if(sources_list[0] in maxEvoTreeDepth) {
                                    // data for all evolutions is added when the first pokemon is added
                                    continue;
                                }

                                let evo_tree = {}
                                let last_target = evolutions[evolutions.length-1].target

                                for(let i = evolutions.length - 1; i >= 0; i--) {
                                    let evolution = evolutions[i];
                                    let source = evolution.source;
                                    let target = evolution.target;

                                    if(sources_list.indexOf(target) == -1) {
                                        evo_tree[target] = {}
                                        evo_tree[target][target] = []
                                    }

                                    if(!(source in evo_tree)) {
                                        evo_tree[source] = {}
                                        evo_tree[source][source] = [evo_tree[target]];
                                    } else {
                                        evo_tree[source][source].push(evo_tree[target]);
                                    }
                                }

                                let final_tree = evo_tree[sources_list[0]]
                                let createPaths = function(stack, tree, paths) {
                                    if (tree === null) {
                                        return
                                    }
                                    let name = Object.keys(tree)[0];
                                    let children = tree[name];
                                    let num_children = children.length;

                                    // append this node to the path array
                                    stack.push(name)
                                    if(num_children === 0) {
                                        // append all of its children
                                        paths.push(stack.reverse().join('|'));
                                        stack.reverse()
                                    } else {
                                        // otherwise try subtrees
                                        for(let i = 0; i < num_children; i++) {
                                            createPaths(stack, children[i], paths)
                                        }
                                    }
                                    stack.pop()
                                }
                                let parseEvolutionPaths = function(tree) {
                                    let paths = []
                                    createPaths([], tree, paths)

                                    // get remaining number of evolutions in each path and total number
                                    // of evolutions along each path
                                    let pokemon_path_data = {}
                                    for(let p = 0; p < paths.length; p++) {
                                        let mons = paths[p].split('|')
                                        for(let m = 0; m < mons.length; m++) {
                                            // first or only appearance
                                            if(!(mons[m] in pokemon_path_data)) {
                                                pokemon_path_data[mons[m]] = {'remaining': m, 'total': mons.length - 1}
                                            }
                                            // pokemon has multiple evolution paths
                                            else {
                                                const remaining = pokemon_path_data[mons[m]].remaining
                                                const total = pokemon_path_data[mons[m]].total
                                                pokemon_path_data[mons[m]].remaining = (remaining + m) / 2
                                                pokemon_path_data[mons[m]].total = (total + mons.length - 1) / 2
                                            }
                                        }
                                    }

                                    // return paths.map((p) => { return p.split('|').length })
                                    return pokemon_path_data;
                                }

                                // - 1 because there is one less evolution then there are pokemon
                                let parsed_path_data = parseEvolutionPaths(final_tree);
                                for(let p in parsed_path_data) {
                                    maxEvoTreeDepth[p] = parsed_path_data[p];
                                    maxEvoTreeDepth[dex_ids[p]] = parsed_path_data[p];
                                }
                                // maxEvoTreeDepth[pokemon] = Math.max(...parseEvolutionPaths(final_tree)) - 1;
                                // maxEvoTreeDepth[dex_ids[pokemon]] = maxEvoTreeDepth[pokemon]
                            } // if evolutions.length
                            // add pokemon that don't evolve
                            else {
                                maxEvoTreeDepth[pokemon] = {'remaining': 0, 'total': 0}
                                maxEvoTreeDepth[dex_ids[pokemon]] = maxEvoTreeDepth[pokemon]
                            }
                        } // for pokemon in parsed_families

                        localStorage.setItem("QoLEvolutionTreeDepth", JSON.stringify(maxEvoTreeDepth))

                        progressSpan.textContent = "Complete!"
                    }); // preprocessEvolutionData
                }) // loadEvolutionTrees
            } // if dexNumbers.length > 0
            else {
                progressSpan.textContent = "Complete!"
            }
        }) // loadDexPage
    }));

    $(document).on('click', '#resetPageSettings', (function() {
        const page = $(this).parent().find('select').val()
        PFQoL.clearPageSettings(page)
    }));

    $(document).on('click', '#clearCachedDex', (function() {
        localStorage.removeItem('QoLEvolveByLevel')
        localStorage.removeItem('QoLDexIDsCache')
        localStorage.removeItem("QoLEvolutionTreeDepth")
    }));

    $(document).on('click', 'h3.slidermenu', (function() { //show hidden li in change log
        $(this).next().slideToggle();
    }));

})(jQuery); //end of userscript
