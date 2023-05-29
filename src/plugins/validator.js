import VeeValidate from "vee-validate";
import Vue from "vue";
//import validationMessages from 'vee-validate/dist/locale/en';
import i18n from "../i18n";
import store from "../store";

export const maxArrayCountRule = {
  getMessage(field, maxCount, data) {
    return (
      (data && data.message) ||
      (window.vm
        ? window.vm.$t(`validation.messages.maxlength`, [field, maxCount[0]])
        : `You can select ${maxCount[0]} ${field} or less`)
    );
  },
  validate(tags, maxCount) {
    if (tags.length <= maxCount[0]) {
      return true;
    }
    return false;
  }
};

export const minArrayCountRule = {
  getMessage(field, minCount, data) {
    return (
      (data && data.message) ||
      (window.vm
        ? window.vm.$t(`validation.messages.minlength`, [field, minCount[0]])
        : `You must select at least ${minCount[0]} ${field}`)
    );
  },
  validate(tags, minCount) {
    if (tags.length >= minCount[0]) {
      return true;
    }
    return false;
  }
};

export const phoneValidation = {
  getMessage(field, data) {
    return (
      (data && data.message) ||
      (window.vm
        ? window.vm.$t(`validation.messages.phone_validation`)
        : `Add country code included phone number( ex: +1234567890 )`)
    );
  },
  validate(input, data) {
    const MOBILEREG = /^\+[(]?[0-9]{1,3}[)]?[0-9]{3}[0-9]{4,6}$/im;
    
    // Check for either of these to return true
    return MOBILEREG.test(input);
  }
};

VeeValidate.Validator.extend("minlength", minArrayCountRule);
VeeValidate.Validator.extend("maxlength", maxArrayCountRule);
VeeValidate.Validator.extend("phone_validation", phoneValidation);

Vue.use(VeeValidate, {
  i18nRootKey: "validation", // customize the root path for validation messages.
  i18n,
  errorBagName: "vErrors",
  fieldsBagName: "vFields",
  inject: true,
  dictionary: {
    // en: validationMessages
  }
});

function getErrorMessage(vue, ref, form = null) {
  let userLanguage = "en";
  if (store.getters["auth/user"]) {
    userLanguage = store.getters["auth/user"].lang;
  } 

  let errorMessage = "";
  if (vue.vFields[ref]) {
    errorMessage = vue.vErrors.first(ref)
      ? vue.vErrors.first(ref)
      : form &&
        form.getError(ref) &&
        vue.vFields[ref] && !vue.vFields[ref].changed
      ? form.getError(ref).message
      : null;
  }

  if (errorMessage) {
    const validationlocales = require(`../locales/${userLanguage}.json`);
    if (errorMessage.includes(ref)) {
      const re = new RegExp(`\\b${ref}\\b`, "gi");
      const replaceText = validationlocales[ref] 
      ? validationlocales[ref] : validationlocales[ref.charAt(0).toUpperCase() + ref.slice(1)];


      return errorMessage.replace(re, replaceText);
    }


    return errorMessage;
  } else {
    return form && form.getError && form.getError(ref) ? form.getError(ref).message : null;
  }
}

//function for check the field states
Vue.use({
  install(Vue) {
    Vue.prototype.$validateState = function(ref, form = null) {
      const message = getErrorMessage(this, ref, form);
      const ret =
        message === null || message.message === null || message.message === "";
      return !ret;
    };

    Vue.prototype.$displayError = function(ref, form = null) {
      return getErrorMessage(this, ref, form);
    };
  }
});
