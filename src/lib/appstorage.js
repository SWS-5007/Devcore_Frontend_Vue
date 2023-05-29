export class AppStorage {
    static loaded = false;
    static data = {};

    static load(force = false) {
        if (!AppStorage.loaded || force) {
            AppStorage.data = JSON.parse(localStorage.getItem('APP_DATA') || '{}');
        }
    }

    static persist() {
        localStorage.setItem('APP_DATA', JSON.stringify(this.data));
    }

    static set(key, value) {
        AppStorage.load();
        this.data[key] = value;
        AppStorage.persist();
    }

    static get(key, defaultValue = null) {
        AppStorage.load();
        return this.data[key] != undefined ? this.data[key] : defaultValue;
    }
}