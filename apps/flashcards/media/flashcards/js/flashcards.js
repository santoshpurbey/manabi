  dojo.require("dijit.Dialog");
  dojo.require("dijit.form.TextBox");
  dojo.require("dijit.form.Button");
  dojo.require("dijit.form.FilteringSelect");
  dojo.require("dojo.data.ItemFileReadStore");
  dojo.require("dijit.form.MultiSelect");
  dojo.require("dojox.form.DropDownSelect");
  dojo.require("dijit.form.Textarea");
  dojo.require("dijit.form.SimpleTextarea");
  dojo.require("dojo.DeferredList");
  dojo.require("dojox.form.CheckedMultiSelect");
  dojo.require("dijit.form.Form");
  dojo.require("dijit.layout.ContentPane");
  dojo.require("dojox.form.BusyButton");
  dojo.require("dojox.widget.Standby");
  dojo.require("dojox.grid.DataGrid");
  dojo.require("dijit.layout.TabContainer");
  dojo.require("dijit.Declaration");
  dojo.require("dojo.data.ItemFileWriteStore");
  dojo.require("dijit.form.NumberSpinner");
  

  // If you're reading this code, please be warned that this section is quite messy.
  // I wrote it while I was still learning JS and Dojo. I think my later output is much
  // cleaner. I'll try to fix this stuff up soon though before it bites me back.


  //TODO all this code and globals really need to be encapsulated
  //this is a start on encapsulating new stuff I add:
  //object to hold things for the Fact Add dialog.
  var fact_add_ui = {};

  fact_add_ui.keyboard_shortcut_connection = null;

  

  fact_add_ui.setKeyboardShortcuts = function() {
    console.log('set shortcuts');
    fact_add_ui.keyboard_shortcut_connection = dojo.connect(factAddDialog, 'onkeypress', function(e) {
        var k = dojo.keys;
        console.log(dojo.isCopyKey(e));
        if (dojo.isCopyKey(e)) {
            //meta (on mac) or ctrl (on PC) is pressed
            switch(e.charOrCode) {
                case k.ENTER:
                    console.log('m-enter');
                    //submit form
                    dojo.stopEvent(e);
                    fact_add_ui.factAddFormSubmit();
                    break;
            }

        }/*
        switch(e.charOrCode) {
            case k.
            case dojo.keys.LEFT:
            case 'h':
                 // go left
            
       }
       dojo.stopEvent(e);*/
    });
  };

  fact_add_ui.unsetKeyboardShortcuts = function() {
    dojo.disconnect(fact_add_ui.keyboard_shortcut_connection);
  };
  
  
  function ajaxLink(url, container_id) {
      dijit.byId(container_id).attr('href', url);
  }
  
  
  
  function factFormSubmit(submitSuccessCallback, submitErrorCallback, _cardTemplatesInput, _factAddForm, factId, showStandby) {
      if (showStandby) {factAddDialogStandby.show();}
      var cardTemplatesValue = _cardTemplatesInput.attr('value');
      var tempCardCounter = 0;
      var newCardTemplatesValue = {};
      var factAddFormValue = _factAddForm.attr('value');
      cardTemplatesValue = dojo.forEach(cardTemplatesValue, function(val){
          var newKey = 'card-'+(tempCardCounter++)+'-template';
          factAddFormValue[newKey] = val;
      });
      
      factAddFormValue['card-TOTAL_FORMS'] = tempCardCounter.toString();
      factAddFormValue['card-INITIAL_FORMS'] = '0'; //tempCounter; //todo:if i allow adding card templates in this dialog, must update this
      factAddFormValue['field_content-TOTAL_FORMS'] = fieldContentInputCount.toString();
      factAddFormValue['field_content-INITIAL_FORMS'] = factId ? fieldContentInputCount.toString() : '0'; //fieldContentInputCount; //todo:if i allow adding card templates in this dialog, must update this
      //factAddFormValue['fact-id']
      //alert('submitted w/args:\n' + dojo.toJson(factAddFormValue));
      
      var xhrArgs = {
          url: factId ? '/flashcards/rest/facts/'+factId : '/flashcards/rest/facts',//url: '/flashcards/rest/decks/'+factAddFormValue['fact-deck']+'/facts', //TODO get URI restfully
          content: factAddFormValue,
          handleAs: 'json',
          load: function(data){
              if (data.success) {
                  submitSuccessCallback(data, tempCardCounter);
              } else {
                  submitErrorCallback(data, tempCardCounter);
              }
          },
          error: function(error){
              submitErrorCallback(data, tempCardCounter); //TODO other callback
          }
      }
      //dojo.byId("response2").innerHTML = "Message being sent..."
      //Call the asynchronous xhrPost
      dojo.xhrPost(xhrArgs); //var deferred = 
      //dojo.place('Added '+tempCardCounter.toString()+' cards for '+'what'+'<br>','factAddFormResults', 'last');
  }
  
  function resetFactAddForm() {
      //factAddForm.reset(); //don't reset everything... just the field contents
      dojo.query('textarea',factAddDialog.domNode).forEach(function(node, index, arr){ node.value=''; });

      //destroy any error messages
      dojo.query('#factFields > .field_content_error').empty();

      //focus the first text field
      dojo.query('textarea', factAddDialog.domNode)[0].focus();
  }
  
  function createFieldInputsForUpdate(domNode, factTypeId, factFieldValues, cardTemplatesOnCompleteCallback, factFieldsOnCompleteCallback) { //todo:refactor into 2 meths
      if (factTypeId) {
          //add card template options
          var cardUpdateTemplatesStore = new dojo.data.ItemFileReadStore({url: '/flashcards/rest/facts/'+factFieldValues['fact-id'][0]+'/card_templates'});
          var cardUpdateTemplatesButton = new DropDownMultiSelect({inputId: 'cardUpdateTemplatesInput'+factTypeId});//TODO counter suffix
          var cardUpdateTemplatesInput = dijit.byId('cardUpdateTemplatesInput'+factTypeId);
          
          //hidden form elements, for fact id
          var hiddenFactField = new dijit.form.TextBox({value:'PUT', name:'_method', type:'hidden'});//dojo.place('<input type=\"hidden\" name=\"fact\" value=\"'+factTypeId+'\">', domNode, 'last');
          hiddenFactField.placeAt(domNode, 'last');
          hiddenFactField = new dijit.form.TextBox({value:factTypeId, name:'fact-id', type:'hidden'});//dojo.place('<input type=\"hidden\" name=\"fact\" value=\"'+factTypeId+'\">', domNode, 'last');
          hiddenFactField.placeAt(domNode, 'last');
          cardUpdateTemplatesButton.placeAt(domNode, 'last');
            //todo:pull values from the fact store for that id*/
          var formPrefix = 'form_'+factTypeId+'-';
          var cardTemplateCounter = 0;
          cardUpdateTemplatesStore.fetch({
              onItem: function(item){
                 if (cardUpdateTemplatesStore.getValue(item, 'activated_for_fact')) {
                     cardUpdateTemplatesInput.addOption({value: cardUpdateTemplatesStore.getValue(item, 'card_template')['id']+"", label: cardUpdateTemplatesStore.getValue(item, 'card_template')['name'], selected: 'selected'});
                 } else {
                     cardUpdateTemplatesInput.addOption({value: cardUpdateTemplatesStore.getValue(item, 'card_template')['id']+"", label: cardUpdateTemplatesStore.getValue(item, 'card_template')['name']});
                 }
              },
              onComplete: function(items) {
                  cardTemplatesOnCompleteCallback(items);
              }
          });
          
          //add FieldContent textboxes (based on Fields)
          var fieldsStore = new dojo.data.ItemFileReadStore({url:'/flashcards/rest/fact_types/'+factTypeId+'/fields', clearOnClose:true}); //todo:try with marked up one instead
          var fieldCounter = 0;
          fieldsStore.fetch({
              onItem: function(item) {
                  var tempFieldCounter = fieldCounter++; 
                  var fieldContentHeaderHTML = '<div><strong>'+fieldsStore.getValue(item, 'name')+':</strong>';
                  if (!fieldsStore.getValue(item, 'blank')) {
                      fieldContentHeaderHTML += ' (required)';
                  }
                  dojo.place(fieldContentHeaderHTML, domNode, 'last');
                  dojo.place('<div id="id_field_content-'+tempFieldCounter+'-content-errors" class="field_content_error" />', domNode, 'last');
                  //console.log(factFieldValues);
                  //console.log('id'+fieldsStore.getValue(item, 'id'));
                  //console.log(factFieldValues['id'+fieldsStore.getValue(item, 'id')][0]);
                  var fieldTextarea = new dijit.form.SimpleTextarea({
                      name: 'field_content-'+tempFieldCounter+'-content', //fieldsStore.getValue(item, 'name'),
                      class: 'field_content',
                      id: formPrefix+'id_field_content-'+tempFieldCounter+'-content',
                      jsId: formPrefix+'id_field_content_'+tempFieldCounter+'_content',
                      value: factFieldValues['id'+fieldsStore.getValue(item, 'id')][0],//"",
                      style: "width:300px;",
                      rows: '2'
                  }).placeAt(domNode, 'last');
                  fieldTextarea.attr('gridStoreItemId', 'id'+fieldsStore.getValue(item, 'id')); //TODO this is a hack - all this code needs to be refactored
                  
                  //dojo.place('<input type="hidden" dojoType="dijit.form.TextBox" name="field_content-'+tempFieldCounter+'-field" id="id_field_content-'+tempFieldCounter+'id" value="'+fieldsStore.getValue(item, 'id')+'" />', 'factFields', 'last');
                  new dijit.form.TextBox({
                      name: 'field_content-'+tempFieldCounter+'-field_type',
                      id: formPrefix+'id_field_content-'+tempFieldCounter+'-field_type',
                      jsId: formPrefix+'id_field_content_'+tempFieldCounter+'_field_type',
                      value: fieldsStore.getValue(item, 'id'),
                      type: 'hidden'
                  }).placeAt(domNode, 'last');
                  
                  new dijit.form.TextBox({
                      name: 'field_content-'+tempFieldCounter+'-id',
                      value: factFieldValues['id'+fieldsStore.getValue(item, 'id')+'_field-content-id'][0],
                      type: 'hidden'
                  }).placeAt(domNode, 'last');

                  dojo.place('</div>', domNode, 'last');
              },
              onComplete: function(items) {
                  fieldContentInputCount = fieldCounter;
                  factFieldsOnCompleteCallback(items);
              }
          });
      }
  }
  
  
  //create field inputs, and refresh card templates
  //TODO redundant code refactor
  function createFieldInputs(evt, cardTemplatesOnCompleteCallback, factFieldsOnCompleteCallback) { //todo:refactor into 2 meths
      if (evt) {
          //add card template options
          var cardTemplatesStore = new dojo.data.ItemFileReadStore({url: '/flashcards/rest/fact_types/'+evt+'/card_templates', jsId:'cardTemplatesStore'});
          var cardTemplatesInput = dijit.byId('cardTemplatesInput');
          cardTemplatesInput.removeOption(cardTemplatesInput.getOptions());

          dojo.query('div#factFields >').forEach(function(node, index, arr) {
              if (dijit.byId(node.id)) {
                  dijit.byId(node.id).destroy();
              }
          });
          dojo.empty('factFields');
          
          var cardTemplateCounter = 0;
          cardTemplatesStore.fetch({
              onItem: function(item){
                 if (cardTemplatesStore.getValue(item, 'generate_by_default')) {
                     cardTemplatesInput.addOption({value: cardTemplatesStore.getValue(item, 'id')+"", label: cardTemplatesStore.getValue(item, 'name'), selected: 'selected'});
                 } else {
                     cardTemplatesInput.addOption({value: cardTemplatesStore.getValue(item, 'id')+"", label: cardTemplatesStore.getValue(item, 'name')});
                 }
                 //dojo.place('<input type="hidden" name="card_template-'+cardTemplateCounter+'-id" id="id_card_template-'+cardTemplateCounter+'-id" />', 'cardTemplatesHiddenInput', 'last');
              }, //Todo:select defaults (must be at least 1)
              onComplete: function(items) {
                  //todo:select the defaults.
                  cardTemplatesOnCompleteCallback(items);
              }
          });
          
          //add FieldContent textboxes (based on Fields)
          var fieldsStore = new dojo.data.ItemFileReadStore({url:'/flashcards/rest/fact_types/'+evt+'/fields', jsId:'fieldsStore', clearOnClose:true}); //todo:try with marked up one instead
          var fieldCounter = 0;
          fieldsStore.fetch({
              onItem: function(item) {
                  var tempFieldCounter = fieldCounter++; 
                  var fieldContentHeaderHTML = '<div><strong>'+fieldsStore.getValue(item, 'name')+':</strong>';
                  if (!fieldsStore.getValue(item, 'blank')) {
                      fieldContentHeaderHTML += ' (required)';
                  }
                  dojo.place(fieldContentHeaderHTML, 'factFields', 'last');
                  dojo.place('<div id="id_field_content-'+tempFieldCounter+'-content-errors" class="field_content_error" />', 'factFields', 'last');
                  var fieldTextarea = new dijit.form.SimpleTextarea({
                      name: 'field_content-'+tempFieldCounter+'-content', //fieldsStore.getValue(item, 'name'),
                      id: 'id_field_content-'+tempFieldCounter+'-content',
                      jsId: 'id_field_content_'+tempFieldCounter+'_content',
                      value: "",
                      style: "width:300px;",
                      rows: '2'
                  }).placeAt('factFields', 'last');
                  
                  //dojo.place('<input type="hidden" dojoType="dijit.form.TextBox" name="field_content-'+tempFieldCounter+'-field" id="id_field_content-'+tempFieldCounter+'id" value="'+fieldsStore.getValue(item, 'id')+'" />', 'factFields', 'last');
                  new dijit.form.TextBox({
                      name: 'field_content-'+tempFieldCounter+'-field_type',
                      id: 'id_field_content-'+tempFieldCounter+'-field_type',
                      jsId: 'id_field_content_'+tempFieldCounter+'_field_type',
                      value: fieldsStore.getValue(item, 'id'),
                      type: 'hidden'
                  }).placeAt('factFields', 'last');

                  dojo.place('</div>', 'factFields', 'last');
                  //dijit.byId(nodeName).addOption({value : dataStore.getValue(item, 'id'), label: dataStore.getValue(item, 'name')});
              },
              onComplete: function(items) {
                  fieldContentInputCount = fieldCounter;
                  factFieldsOnCompleteCallback(items);
              }
          });
      }
  }
  var factTypeInputOnChangeHandle = null;
  var lastCardTemplatesInputValue = null;
  var fieldContentInputCount = null;
  
  function appendLineToAddedCardHistory(node, text) {
    //append a line, but if there are too many lines, delete the first line
    //(this is messy...)
    existing_lines = node.innerHTML.split('<br>');
    if (existing_lines.length > 4) {
        //delete first line
        existing_lines.shift();
        node.innerHTML = existing_lines.join('<br>');
    }
    node.innerHTML += text + '<br>';
  }

  fact_add_ui.factAddFormSubmit = function() {
    var cardTemplatesInput = dijit.byId('cardTemplatesInput');
    factFormSubmit(function(data, tempCardCounter){
    //dojo.place('Added '+tempCardCounter.toString()+' cards for '+factAddFormValue['field_content-0-content']+'<br>','factAddFormResults', 'last');
      if (dojo.trim(factAddFormResults.containerNode.innerHTML) == '') {
          factAddFormResults.containerNode.innerHTML = '';
      }
      //factAddFormResults.containerNode.innerHTML += 'Added '+tempCardCounter.toString()+' cards for '+dijit.byId('id_field_content-0-content').attr('value')+'<br>';
      appendLineToAddedCardHistory(factAddFormResults.containerNode, 'Added '+tempCardCounter.toString()+' cards for '+dijit.byId('id_field_content-0-content').attr('value'));
      resetFactAddForm();
      factAddDialogStandby.hide();
    }, function(data, tempCardCounter) {
      //show field_content errors
      fieldContentErrors = data.errors.field_content;//[errors][field_content];
      dojo.forEach(fieldContentErrors, function(errorMsg, idx) {
          if ('content' in errorMsg) {
              dojo.byId('id_field_content-'+idx+'-content-errors').innerHTML = '<font color="red"><i>'+errorMsg.content.join('<br>')+'</i></font>';
          } else {
              dojo.empty(dojo.byId('id_field_content-'+idx+'-content-errors'));
          }
      });
      //dojo.forEach(data.errors.card)
      factAddDialogStandby.hide();
    }, cardTemplatesInput, factAddForm, null, true);
  }
  
  //connect to Add Fact form submit
  dojo.addOnLoad(function() {
          dojo.connect(factAddForm, 'onSubmit', function(e) {
            e.preventDefault();
            fact_add_ui.factAddFormSubmit();
          });
  });
