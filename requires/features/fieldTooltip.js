class FieldTooltipFeature {
    constructor() {
        this.defaultSettings = {
            tooltipEnableMods: false,
            tooltipNoBerry: false,
            tooltipBerry: false,
        };

        this.settings = this.defaults;
    }

    loadSettings() {}

    saveSettings() {}

    populateSettings() {}

    resetSettings() {
        this.settings = JSON.parse(JSON.stringify(this.defaultSettings));
        this.saveSettings()
    }

    settingsChange() {}

    getHtml() {
        return GM_getResourceText('featureTooltip');
    }

    setupCss() {
        const background_color = "rgb(226, 255, 205)";
        const border = "1px solid rgb(158, 198, 144)";
        $("#tooltipenable").css("background-color", ""+background_color+"");
        $("#tooltipenable").css("border", ""+border+"");
        $("#tooltipenable").css("max-width", "600px");
        $("#tooltipenable").css("position", "relative");
        $("#tooltipenable").css("margin", "16px auto");
        $("#fieldsearch").css("background-color", ""+background_color+"");
        $("#fieldsearch").css("border", ""+border+"");
        $(".collapsible").css("background-color", ""+background_color+"");
        $(".collapsible").css("border", ""+border+"");
        $(".collapsible_content").css("background-color", ""+background_color+"");
    }

    runOnObserver() {}

    setupHandlers() {
        const obj = this
        $(window).on('load', (function() {
            obj.loadSettings();
            obj.run();
            obj.saveSettings();
        }));

        $('.collapsible').on('click', function() {
            this.classList.toggle('active');
            var content = this.nextElementSibling;
            if(content.style.display === "block") {
                content.style.display = "none";
            } else {
                content.style.display = "block"
            }
        });

        $('#field_berries').on('click', function() {
            obj.loadSettings();
            obj.run()
            obj.saveSettings();
        });

        $('.tooltipsetting[data-key=tooltipEnableMods]').on('click', function() {
            obj.loadSettings();
            obj.run();
            obj.saveSettings();
        })

        $('.tooltipsetting[data-key=tooltipNoBerry]').on('click', function() {
            obj.loadSettings();
            obj.run();
            obj.saveSettings();
        });

        $('.tooltipsetting[data-key=tooltipBerry]').on('click', function() {
            obj.loadSettings();
            obj.run();
            obj.saveSettings();
        });
    } // setupHandlers
    run() {
        const obj = this
        if($('.tooltipsetting[data-key=tooltipEnableMods]').prop('checked')) {
            // make sure checkboxes are enabled
            $('.tooltipsetting[data-key=tooltipNoBerry]').prop('disabled', false)
            $('.tooltipsetting[data-key=tooltipBerry]').prop('disabled', false)

            // use the correct setting to turn on the tooltips based on the berries
            if($('#field_berries').hasClass('selected')) {
                if($('.tooltipsetting[data-key=tooltipBerry]').prop('checked')) { obj.disableTooltips(); }
                else { obj.enableTooltips(); }
            } else {
                if($('.tooltipsetting[data-key=tooltipNoBerry]').prop('checked')) { obj.disableTooltips(); }
                else { obj.enableTooltips(); }
            }
        } else {
            $('.tooltipsetting[data-key=tooltipNoBerry]').prop('disabled', true)
            $('.tooltipsetting[data-key=tooltipBerry]').prop('disabled', true)
            // if tooltipNoBerry was checked before the mods were disabled, reenable the tooltips
            if($('.tooltipsetting[data-key=tooltipNoBerry]').prop('checked')) {
                obj.enableTooltips();
            }
        }
    }
    disableTooltips() {
        $('#field_field>div.field>.fieldmon').removeAttr('data-tooltip').removeClass('tooltip_trigger')
    }
    enableTooltips() {
        $('#field_field>div.field>.fieldmon').attr('data-tooltip', "")
    }
}
