class ShelterPage extends Page {
    constructor() {
        super('QoLShelter', {
            // checkboxes
            findNewEgg: true,
            findNewPokemon: true,
            findShiny: true,
            findAlbino: true,
            findMelanistic: true,
            findPrehistoric: true,
            findDelta: true,
            findMega: true,
            findStarter: true,
            findCustomSprite: true,
            findReadyToEvolve: false,
            ///////////////////////////////////////////////
            // genders
            findMale: true,
            findFemale: true,
            findNoGender: true,
            ///////////////////////////////////////////////
            // custom search
            findCustom: "",
            customEgg: true,
            customPokemon: true,
            customPng: false,
            ///////////////////////////////////////////////
            // sort
            shelterGrid: true,
        }, '/shelter')
        // this.customArray = [];
        // this.typeArray = [];

        this.FIND_MATCHING_EGG = "findMatchingEgg"
        this.FIND_MATCHING_PKM = "findMatchingPokemon"
        this.SEARCH_FOR_EGG_MARKER = "[E]"
        this.SEARCH_FOR_PKM_MARKER = "[P]"

        ///////////////////////////////////////////////
        // types
        // format: [type1|[[E]][[P]], type2|[[E]][[P]]]
        this.FIND_TYPE_EGGS = "findTypeEggs"
        this.FIND_TYPE_PKMS = "findTypePokemon"
        this.settings.findType = ""
        // these two are used to enable searching for all types
        this.settings[this.FIND_TYPE_EGGS] = false
        this.settings[this.FIND_TYPE_PKMS] = false
        
        const obj = this
        this.observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                obj.customSearch();
            });
        });
    }

    setupHTML() {
        $('.tabbed_interface.horizontal>div').removeClass('tab-active');
        $('.tabbed_interface.horizontal>ul>li').removeClass('tab-active');
        document.querySelector('.tabbed_interface.horizontal>ul').insertAdjacentHTML('afterbegin', '<li class="tab-active"><label>Search</label></li>');
        document.querySelector('.tabbed_interface.horizontal>ul>li').insertAdjacentHTML('afterend', '<li class=""><label>Sort</label></li>');
        document.querySelector('.tabbed_interface.horizontal>ul').insertAdjacentHTML('afterend', TEMPLATES.shelterSettingsHTML);
        document.querySelector('#shelteroptionsqol').insertAdjacentHTML('afterend', '<div id="qolsheltersort"><label><input type="checkbox" class="qolsetting" data-key="shelterGrid"/><span>Sort by Grid</span></label>');
        $('#shelteroptionsqol').addClass('tab-active');

        document.querySelector('#sheltercommands').insertAdjacentHTML('beforebegin', '<div id="sheltersuccess"></div>');

        // const theField = Helpers.textSearchDivWithCheckboxes('numberDiv', 'findCustom', 'removeShelterTextfield', 'customArray')
        const theField = Helpers.textSearchDivWithCheckboxes('numberDiv', 'findCustom', 'removeTextField')
        const theType = Helpers.selectSearchDiv('typeNumber', 'types', 'findType', GLOBALS.TYPE_OPTIONS,
                                             'removeTypeSearch', 'fieldTypes', 'findType');
        const customArray = this.settings.findCustom.split(',')
        let typeArray = this.settings.findType.split(',');

        Helpers.setupFieldArrayHTML(customArray, 'searchkeys', theField, 'numberDiv', 'qolsetting', 'search')

        // strip out egg/pokemon markers so setupFieldArray will work
        let justTypes = typeArray.map((t) => {return t.replace(this.SEARCH_FOR_EGG_MARKER,'').replace(this.SEARCH_FOR_PKM_MARKER,'')})
        Helpers.setupFieldArrayHTML(justTypes, 'typeTypes', theType, 'typeNumber', 'qolselect', 'type')
        // setup the type checkboxes
        for(let i = 0; i < typeArray.length; i++) {
            let elem = typeArray[i]
            if(elem.includes(this.SEARCH_FOR_EGG_MARKER)) {
                this.toggleCheckboxForType(i, this.SEARCH_FOR_EGG_MARKER, true)
            }
            if(elem.includes(this.SEARCH_FOR_PKM_MARKER)) {
                this.toggleCheckboxForType(i, this.SEARCH_FOR_PKM_MARKER, true)
            }
        }

        $('[data-shelter=reload]').addClass('customSearchOnClick');
        $('[data-shelter=whiteflute]').addClass('customSearchOnClick');
        $('[data-shelter=blackflute]').addClass('customSearchOnClick');
    }
    setupCSS() {
        let shelterSuccessColor = $('#sheltercommands').css('background-color');
        let shelterSuccessBorder = "1px solid rgb(158, 198, 144)"
        $('#sheltersuccess').css('background-color', shelterSuccessColor);

        // accordian CSS
        $(".accordian").css("background-color", ""+shelterSuccessColor)
        $(".accordian").css("color", "#444")
        $(".accordian").css("cursor", "pointer")
        $(".accordian").css("padding", "18px")
        $(".accordian").css("width", "100%")
        $(".accordian").css("border", ""+shelterSuccessBorder)
        $(".accordian").css("text-align", "left")
        $(".accordian").css("outline", "none")
        $(".accordian").css("font-size", "15px")
        $(".accordian").css("transition", "0.4s")
        $(".active,.accordion:hover").css("background-color", "#ccc")
        $(".accordianPanel").css("padding", "0 18px")
        $(".accordianPanel").css("display", "none")
        $(".accordianPanel").css("background-color", ""+shelterSuccessColor)
        $(".accordianPanel").css("overflow", "hidden")
    }
    setupObserver() {
        this.observer.observe(document.querySelector('#shelterarea'), {
            childList: true,
        });
    }
    setupHandlers() {
        const obj = this
        $(document).on('change', '#shelteroptionsqol input', (function() { //shelter search
            obj.loadSettings();
            obj.customSearch();
            obj.saveSettings();
        }));

        $(document).on('change', '.qolsetting', (function() {
            obj.loadSettings();
            obj.customSearch();
            obj.saveSettings();
        }));

        $(document).on('input', '.qolsetting', (function() { //Changes QoL settings
            obj.settingsChange(this.getAttribute('data-key'),
                               $(this).val(),
                               $(this).parent().parent().attr('class'),
                               $(this).parent().attr('class'),
                               (this.hasAttribute('array-name') ? this.getAttribute('array-name') : ''));
            obj.shelterSpecificSettingsChange(this)
            obj.customSearch();
            obj.saveSettings();
        }));

        $('.customSearchOnClick').on('click', (function() {
            obj.loadSettings();
            obj.customSearch();
            obj.saveSettings();
        }));

        $(document).on('click', '#addTextField', (function() { //add shelter text field
            obj.addTextField();
            obj.saveSettings();
        }));

        $(document).on('click', '#removeTextField', (function() { //remove shelter text field
            obj.removeTextField(this, $(this).parent().find('input').val());
            obj.saveSettings();
            obj.customSearch();
        }));

        $(document).on('click', '#addTypeSearch', (function() { //add shelter type list
            obj.addTypeList();
            obj.saveSettings();
            obj.customSearch();
        }));

        $(document).on('click', '#removeTypeSearch', (function() { //remove shelter type list
            obj.removeTypeList(this, $(this).parent().find('select').val());
            obj.saveSettings();
            obj.customSearch();
        }));

        $(document).on('click', '.accordian', (function() {
            /* Toggle between adding and removing the "active" class,
            to highlight the button that controls the panel */
            this.classList.toggle("active")
            /* Toggle between hiding and showing the active panel */
            var panel = this.nextElementSibling;
            if (panel.style.display === "block") {
                panel.style.display = "none";
            } else {
                panel.style.display = "block";
            }
        }));

        $(document).on('click', `#${obj.FIND_MATCHING_EGG}`, (function() {
            obj.findAndToggleTypeCheckbox(this, obj.SEARCH_FOR_EGG_MARKER)
            obj.customSearch();
            obj.saveSettings();
        }))

        $(document).on('click', `#${obj.FIND_MATCHING_PKM}`, (function() {
            obj.findAndToggleTypeCheckbox(this, obj.SEARCH_FOR_PKM_MARKER)
            obj.customSearch();
            obj.saveSettings();
        }));

        $(document).on('input', '.qolselect', (function() {
            let setting = this.getAttribute('array-name')
            if(setting === "findType") {
                obj.findAndUpdateTypeSelect(this);
            }
            obj.customSearch();
            obj.saveSettings();
        }));
    }
    findAndUpdateTypeSelect(select) {
        let array = this.settings.findType.split(',')
        let index = parseInt(select.parentNode.className.substring("type".length)) - 1
        let elem = array[index]
        let typeIndex = select.value
        let newType = typeIndex
        if(elem.includes("[")) {
            // replace current type with new type
            let currentType = (elem.includes("[") ? elem.substring(0, elem.indexOf("[")) : elem)
            array[index] = newType + elem.substring(elem.indexOf("["))
        } else {
            array[index] = newType
        }
        this.settings.findType = array.join(',')
        this.saveSettings();
    }
    findAndToggleTypeCheckbox(checkbox, eggOrPokemonMarker) {
        let array = this.settings.findType.split(',')
        let index = parseInt($(checkbox).parent().parent()[0].className.substring("type".length)) - 1
        array[index] = this.toggleMarkerSettingForType(array[index], eggOrPokemonMarker, checkbox.checked)
        this.settings.findType = array.join(',')
        this.saveSettings()
    }
    toggleCheckboxForAllTypes(eggOrPokemonMarker, checked) {
        let array = this.settings.findType.split(',')
        for(let i = 0; i < array.length; i++) {
            array[i] = this.toggleMarkerSettingForType(array[i], eggOrPokemonMarker, checked)
            this.toggleCheckboxForType(i, eggOrPokemonMarker, checked)
        } // for
        this.settings.findType = array.join(',')
        this.saveSettings()
    }
    toggleMarkerSettingForType(typeSettingString, eggOrPokemonMarker, checked) {
        let value = typeSettingString
        if(value === "") { value = "None" }
        if(checked && !value.includes(eggOrPokemonMarker)) {
            value += eggOrPokemonMarker
        } else if(!checked && value.includes(eggOrPokemonMarker)) {
            value = value.replace(eggOrPokemonMarker, "")
        }
        return value;
    }
    toggleCheckboxForType(index, eggOrPokemonMarker, checked) {
        const id = (eggOrPokemonMarker === this.SEARCH_FOR_EGG_MARKER) ? this.FIND_MATCHING_EGG :
                   (eggOrPokemonMarker === this.SEARCH_FOR_PKM_MARKER) ? this.FIND_MATCHING_PKM :
                   console.error('Invalid value for Egg/Pokemon type search marker: ' + eggOrPokemonMarker)
        const checkbox = $(`.type${index+1} input#${id}`)
        checkbox.prop('checked', checked)
    }
    shelterSpecificSettingsChange(elem) {
        let datakey = elem.getAttribute('data-key')

        // toggle individual type checkboxes based on overall checkboxes
        if(datakey === this.FIND_TYPE_EGGS || datakey === this.FIND_TYPE_PKMS) {
            let checked = elem.checked
            const marker = (datakey === this.FIND_TYPE_EGGS) ? this.SEARCH_FOR_EGG_MARKER : this.SEARCH_FOR_PKM_MARKER
            this.toggleCheckboxForAllTypes(marker, checked)
        }
    }

    addTextField() {
        // const theField = Helpers.textSearchDiv('numberDiv', 'findCustom', 'removeTextField', 'customArray')
        const theField = Helpers.textSearchDiv('numberDiv', 'findCustom', 'removeTextField')

        let numberDiv = $('#searchkeys>div').length;
        $('#searchkeys').append(theField);
        $('.numberDiv').removeClass('numberDiv').addClass(""+numberDiv+"");
    }
    removeTextField(byebye, key) {
        let customArray = this.settings.findCustom.split(',')
        customArray = $.grep(customArray, function(value) {
            return value != key;
        });
        this.settings.findCustom = customArray.toString()

        $(byebye).parent().remove();

        let i;
        for(i = 0; i < $('#searchkeys>div').length; i++) {
            let rightDiv = i + 1;
            $('.'+i+'').next().removeClass().addClass(''+rightDiv+'');
        }
    }
    addTypeList() {
        // const theList = Helpers.selectSearchDiv('typeNumber', 'types', 'findType', GLOBALS.TYPE_OPTIONS,
        //                                      'removeTypeSearch', 'fieldTypes', 'typeArray');
        const theList = Helpers.selectSearchDiv('typeNumber', 'types', 'findType', GLOBALS.TYPE_OPTIONS,
                                                'removeTypeSearch', 'fieldTypes')
        let numberTypes = $('#typeTypes>div').length;
        $('#typeTypes').append(theList);
        $('.typeNumber').removeClass('typeNumber').addClass("type"+numberTypes+"");

        this.settings.findType += ','
    }
    removeTypeList(byebye, key) {
        let typeArray = this.settings.findType.split(',')
        typeArray = $.grep(typeArray, function(value) {
            let v = (value.includes("[")) ? value.substring(0, value.indexOf("[")) : value;
            return ((v !== key) &&
                    (v !== "") &&
                    (!v.includes("None")));
        });
        this.settings.findType = typeArray.toString()

        $(byebye).parent().remove();

        let i;
        for(i = 0; i < $('#typeTypes>div').length; i++) {
            let rightDiv = i + 1;
            $('.'+i+'').next().removeClass().addClass(''+rightDiv+'');
        }
    }
    insertShelterFoundDiv(number, name, img) {
        document.querySelector('#sheltersuccess').
            insertAdjacentHTML('beforeend',
                               '<div id="shelterfound">' + name + ((number > 1) ? 's' : '') + ' found ' + img + '</div>')
    }
    insertShelterTypeFoundDiv(number, type, stage, names) {
        document.querySelector('#sheltersuccess').
            insertAdjacentHTML('beforeend',
                               '<div id="shelterfound">' + number + ' ' + type + ' ' + stage +
                               ((number > 1) ? 'types' : 'type') + 'found! (' +
                               names.toString() + ')</div>')
    }
    
    searchForImgTitle(key) {
        const SEARCH_DATA = GLOBALS.SHELTER_SEARCH_DATA;
        const key_index = SEARCH_DATA.indexOf(key)
        const value = SEARCH_DATA[key_index + 1]
        const selected = $('img[title*="'+value+'"]')
        if (selected.length) {
            let searchResult = SEARCH_DATA[key_index + 2]; //type of Pokémon found
            let imgResult = selected.length + " " + searchResult; //amount + type found
            let imgFitResult = SEARCH_DATA[key_index + 3]; //image for type of Pokémon
            let shelterBigImg = selected.parent().prev().children('img.big');
            $(shelterBigImg).addClass('shelterfoundme');

            this.insertShelterFoundDiv(selected.length, imgResult, imgFitResult)
        }
    }

    searchForReadyToEvolveByLevel(dexData) {
        let selected = $("#shelterarea .tooltip_content")
        let readyBigImg = [];
        selected.each((idx, s) => {
            let text = s.textContent.split(' ')
            let name = text[0]
            let level = parseInt(text[1].substring(4))

            // get level that pokemon needs to be at to evolve
            let evolve_level = undefined
            if(GLOBALS.EVOLVE_BY_LEVEL_LIST[name] !== undefined) {
                evolve_level = parseInt(GLOBALS.EVOLVE_BY_LEVEL_LIST[name].split(' ')[1])
            }

            if(evolve_level !== undefined && level >= evolve_level) {
                let shelterBigImg = $(s).prev().children('img.big');
                readyBigImg.push(shelterBigImg)
            }
        })

        for(let i = 0; i < readyBigImg.length; i++) {
            $(readyBigImg[i]).addClass('shelterfoundme');
        }

        if(readyBigImg.length) {
            let imgResult = readyBigImg.length + " " + "ready to evolve"
            this.insertShelterFoundDiv(readyBigImg.length, imgResult, "")
        }

    }

    customSearch() {
        const obj = this;
        const SEARCH_DATA = GLOBALS.SHELTER_SEARCH_DATA;
        
        let dexData = GLOBALS.DEX_DATA;
        // search whatever you want to find in the shelter & grid
        let lengthEggs = 0;

        //sort in grid
        $('#shelterarea').removeClass('qolshelterareagrid');
        $('.mq2 #shelterarea').removeClass('qolshelterareagridmq2');
        $('#shelterarea .tooltip_content').removeClass('qoltooltipgrid');
        $('#shelterpage #shelter #shelterarea > .pokemon').removeClass('qolpokemongrid');
        $('#sheltergridthingy').remove();

        if (this.settings.shelterGrid === true) { //shelter grid
            $('#shelterarea').addClass('qolshelterareagrid');
            $('.mq2 #shelterarea').addClass('qolshelterareagridmq2');
            $('#shelterarea .tooltip_content').addClass('qoltooltipgrid');
            $('#shelterpage #shelter #shelterarea > .pokemon').addClass('qolpokemongrid');
            $('#shelterpage #shelter #shelterarea:before').css({'display' : 'none!important'});
            $('<pseudo:before>').attr('style', 'display: none!important');
            $('head').append('<style id="sheltergridthingy">#shelterarea:before{display:none !important;}</style>');
        }

        //search values depending on settings
        const shelterValueArray = [];
        //emptying the sheltersuccess div to avoid duplicates
        document.querySelector('#sheltersuccess').innerHTML="";
        $('#shelterarea>div>img').removeClass('shelterfoundme');

        if(this.settings.findShiny === true) {
            this.searchForImgTitle('findShiny')
        }
        if(this.settings.findAlbino === true) {
            this.searchForImgTitle('findAlbino')
        }
        if(this.settings.findMelanistic === true) {
            this.searchForImgTitle('findMelanistic')
        }
        if(this.settings.findPrehistoric === true) {
            this.searchForImgTitle('findPrehistoric')
        }
        if(this.settings.findDelta === true) {
            this.searchForImgTitle('findDelta')
        }
        if(this.settings.findMega === true) {
            this.searchForImgTitle('findMega')
        }
        if(this.settings.findStarter === true) {
            this.searchForImgTitle('findStarter')
        }
        if(this.settings.findCustomSprite === true) {
            this.searchForImgTitle('findCustomSprite')
        }

        if(this.settings.findNewPokemon === true) {
            let key = 'findNewPokemon'
            let value = SEARCH_DATA[SEARCH_DATA.indexOf(key) + 1]
            let selected = $("#shelterarea .tooltip_content:contains(" + value + ")")
            if (selected.length) {
                let searchResult = SEARCH_DATA[SEARCH_DATA.indexOf(key) + 2];
                let imgFitResult = SEARCH_DATA[SEARCH_DATA.indexOf(key) + 3];
                let tooltipResult = selected.length+" "+searchResult;
                let shelterImgSearch = selected
                let shelterBigImg = shelterImgSearch.prev().children('img.big');
                $(shelterBigImg).addClass('shelterfoundme');
                
                this.insertShelterFoundDiv(selected.length, tooltipResult, imgFitResult)
            }
        }

        if(this.settings.findNewEgg === true) {
            let key = 'findNewEgg'
            let value = SEARCH_DATA[SEARCH_DATA.indexOf(key) + 1]
            let selected = $("#shelterarea .tooltip_content:contains(" + value + ")").filter(function(){
                // .text() will include the text in the View/Adopt and Hide buttons, so there will be a space
                return $(this).text().startsWith(value + " ");
            });

            if (selected.length) {
                let searchResult = SEARCH_DATA[SEARCH_DATA.indexOf(key) + 2];
                let imgFitResult = SEARCH_DATA[SEARCH_DATA.indexOf(key) + 3];
                let tooltipResult = selected.length + " " + searchResult;
                if (selected.length >= 1) {
                    let shelterImgSearch = selected
                    let shelterBigImg = shelterImgSearch.prev().children('img.big');
                    $(shelterBigImg).addClass('shelterfoundme');
                }
                this.insertShelterFoundDiv(selected.length, searchResult, imgFitResult)
            }
        }

        if(this.settings.findReadyToEvolve === true) {
            this.searchForReadyToEvolveByLevel(dexData)
        }
        
        //loop to find all search genders for the custom
        const shelterValueArrayCustom = [];
        for (let key in this.settings) {
            let value = this.settings[key];
            if (value === true) {
                if(key === 'findMale' || key === 'findFemale' || key === 'findNoGender') {
                    let searchKey = GLOBALS.SHELTER_SEARCH_DATA[GLOBALS.SHELTER_SEARCH_DATA.indexOf(key) + 1];
                    shelterValueArrayCustom.push(searchKey);
                }
            }
        }

        //loop to find all the custom search parameters
        let customArray = this.settings.findCustom.split(',')
        // let customSearchAmount = this.customArray.length;
        let customSearchAmount = customArray.length
        const heartPng = `<img src="//pfq-static.com/img/pkmn/heart_1.png/t=1427152952">`;
        const eggPng = `<img src="//pfq-static.com/img/pkmn/egg.png/t=1451852195">`;
        for (let i = 0; i < customSearchAmount; i++) {
            let value = customArray[i];
            if (value != "") {
                //custom pokemon search
                if (this.settings.customPokemon === true) {
                    let genderMatches = []
                    if (shelterValueArrayCustom.indexOf("[M]") > -1) {
                        genderMatches.push("[M]")
                    }
                    if(shelterValueArrayCustom.indexOf("[F]") > -1) {
                        genderMatches.push("[F]")
                    }
                    if(shelterValueArrayCustom.indexOf("[N]") > -1) {
                        genderMatches.push("[N]")
                    }

                    if(genderMatches.length > 0) {
                        for(let i = 0; i < genderMatches.length; i++) {
                            let genderMatch = genderMatches[i];
                            let selected = $("#shelterarea .tooltip_content:containsIN("+value+") img[title*='" + genderMatch + "']")
                            if (selected.length) {
                                let searchResult = value;
                                let genderName = GLOBALS.SHELTER_SEARCH_DATA[GLOBALS.SHELTER_SEARCH_DATA.indexOf(genderMatch) + 1];
                                let imgGender = GLOBALS.SHELTER_SEARCH_DATA[GLOBALS.SHELTER_SEARCH_DATA.indexOf(genderMatch) + 2];
                                let tooltipResult = selected.length + ' ' + genderName + imgGender + " " + searchResult;
                                let shelterImgSearch = selected
                                let shelterBigImg = shelterImgSearch.parent().prev().children('img.big');
                                $(shelterBigImg).addClass('shelterfoundme');

                                this.insertShelterFoundDiv(selected.length, tooltipResult, heartPng)
                            }
                        }
                    }

                    //No genders
                    else if (shelterValueArrayCustom.length === 0) {
                        let selected = $('#shelterarea .tooltip_content:containsIN('+value+'):not(:containsIN("Egg"))')
                        if (selected.length) {
                            let searchResult = value;
                            let tooltipResult = selected.length + " " + searchResult;
                            let shelterImgSearch = selected
                            let shelterBigImg = shelterImgSearch.parent().prev().children('img.big');
                            $(shelterBigImg).addClass('shelterfoundme');
                            this.insertShelterFoundDiv(selected.length, tooltipResult, heartPng)
                        }
                    }
                }

                //custom egg
                if (this.settings.customEgg === true) {
                    let selected = $('#shelterarea .tooltip_content:containsIN('+value+'):contains("Egg")');
                    if (selected.length) {
                        let searchResult = value;
                        let tooltipResult = selected.length + " " + searchResult;
                        let shelterImgSearch = selected;
                        let shelterBigImg = shelterImgSearch.prev().children('img.big');
                        $(shelterBigImg).addClass('shelterfoundme');
                        this.insertShelterFoundDiv(selected.length, tooltipResult, eggPng)
                    }
                }

                //imgSearch with Pokémon
                if (this.settings.customPng === true) {
                    let selected = $('#shelterarea img[src*="'+value+'"]')
                    if (selected.length) {
                        let searchResult = selected.parent().next().text().split('(')[0]
                        let tooltipResult = selected.length+" "+searchResult+' (Custom img search)';
                        let imgFitResult = `<img src="//pfq-static.com/img/pkmn/heart_1.png/t=1427152952">`;
                        let shelterImgSearch = selected
                        $(shelterImgSearch).addClass('shelterfoundme');
                        this.insertShelterFoundDiv(selected.length, tooltipResult, heartPng)
                    }
                }
            }
        }

        //loop to find all the types
        let typeArray = this.settings.findType.split(',')
        const filteredTypeArray = typeArray.filter(v=>v!='');

        if (filteredTypeArray.length > 0) {
            for (let i = 0; i < filteredTypeArray.length; i++) {
                const entry = filteredTypeArray[i];
                const value = entry.includes("[") ? entry.substring(0, entry.indexOf("[")) : entry
                const findTypeEgg = (entry.includes(obj.SEARCH_FOR_EGG_MARKER)) ? true : false;
                const findTypePokemon = (entry.includes(obj.SEARCH_FOR_PKM_MARKER)) ? true : false;
                const foundType = (value === "" || value === "None") ? false :
                    GLOBALS.SHELTER_TYPE_TABLE[GLOBALS.SHELTER_TYPE_TABLE.indexOf(value) + 2];

                if(!foundType) { continue; }

                let selected = undefined;
                let typePokemonNames = [];
                if (findTypeEgg === true) {
                    typePokemonNames = [];
                    selected = $('#shelterarea>.tooltip_content:contains("Egg")')
                    selected.each(function() {
                        let searchPokemon = $(this).text().split('Egg')[0].trim();
                        let searchPokemonIndex = dexData.indexOf('"'+searchPokemon+'"');
                        let searchTypeOne = dexData[searchPokemonIndex + 1];
                        let searchTypeTwo = dexData[searchPokemonIndex + 2];
                        if ((searchTypeOne === value) || (searchTypeTwo === value)) {
                            typePokemonNames.push(searchPokemon);
                        }
                    })

                    for (let o = 0; o < typePokemonNames.length; o++) {
                        let shelterImgSearch = $("#shelterarea .tooltip_content:containsIN('"+typePokemonNames[o]+" Egg')");
                        let shelterBigImg = shelterImgSearch.prev().children('img.big');
                        $(shelterBigImg).addClass('shelterfoundme');
                    }

                    if(typePokemonNames.length) {
                        this.insertShelterTypeFoundDiv(typePokemonNames.length, foundType, 'egg', typePokemonNames)
                    }
                }

                if (findTypePokemon === true) {
                    typePokemonNames = [];
                    selected = $('#shelterarea>.tooltip_content').not(':contains("Egg")')
                    selected.each(function() {
                        let searchPokemon = ($(this).text().split(' ')[0]);
                        let searchPokemonIndex = dexData.indexOf('"'+searchPokemon+'"');
                        let searchTypeOne = dexData[searchPokemonIndex + 1];
                        let searchTypeTwo = dexData[searchPokemonIndex + 2];
                        if ((searchTypeOne === value) || (searchTypeTwo === value)) {
                            typePokemonNames.push(searchPokemon);
                        }
                    })

                    for (let o = 0; o < typePokemonNames.length; o++) {
                        let shelterImgSearch = $("#shelterarea .tooltip_content:containsIN('"+typePokemonNames[o]+" (')")
                        let shelterBigImg = shelterImgSearch.prev().children('img.big');
                        $(shelterBigImg).addClass('shelterfoundme');
                    }

                    if(typePokemonNames.length) {
                        this.insertShelterTypeFoundDiv(typePokemonNames.length, foundType, 'Pokemon', typePokemonNames)
                    }
                }
            }
        } // filteredTypeArray
    } // customSearch
}

const shelterPage = new ShelterPage();
