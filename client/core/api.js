import fetch from 'isomorphic-unfetch'
import isBrowser from './is-browser'

export default class Api {

    get apiPath() {
        let apiPath
        if (isBrowser()) {
            apiPath = `http://${location.hostname}`
        } else {
            apiPath = "http://server:3001"
        }
        return apiPath
    }

    makeSettings(method, data) {
        let settings = {}
        if (method) {
            settings.method = method
        } else {
            settings.method = "GET"
        }

        settings.headers = {
            "Content-Type": "application/json"
        }

        if (data) {
            settings.body = JSON.stringify(data)
        }
        return settings
    }

    async fetch(method, url, data) {
  
        return new Promise((resolve, reject) => {
            fetch(`${this.apiPath}${url}`, this.makeSettings(method, data))
                .then(r => {
                    if (r.ok) {
                        return r.text()
                    } else {
                        return null
                    }
                })
                .then(data => {
                    if (!data) {
                        reject("error")
                    } else { 
                        resolve(data)
                    }
                });
        })
    }

    async fetchJson(method, url, data) {
 
        return new Promise((resolve, reject) => {
            fetch(`${this.apiPath}${url}`, this.makeSettings(method, data))
                .then(r => {
                    if (r.ok) {
                        return r.json()
                    } else {
                        return null
                    }
                })
                .then(data => {
                    if (!data) {
                        reject("error")
                    } else { 
                        resolve(data)
                    }
                });
        })
    }
}