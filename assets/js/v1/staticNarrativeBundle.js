class DataBrowser {
    constructor(options) {
        this.dataFile = options.dataFile
        this.node = options.node
        this.loadData()
    }

    loadData() {
        fetch(this.dataFile)
            .then(data => data.json())
            .then(data => this.render(data))
            .catch(error => this.renderError(error))
    }

    renderError(error) {

    }

    render(data) {
        this.container = this.structureRender()
        this.node.appendChild(this.container)
        if (!data || !data.data || data.data.length === 0) {
            this.container.innerHTML = 'No data was used in this Narrative.'
            return
        }
        data.data.forEach((obj) => {
            let type = obj[2].split('-')[0].split('.')[1]
            new DataCard({
                container: this.container,
                data: obj,
                icon: data.types[type].icon,
                type: type
            })
        })
    }

    structureRender() {
        // do some stuff. make overall structure. I guess.
        let container = document.createElement('div')
        return container
    }
}

class DataCard {
    constructor(options) {
        this.data = options.data
        this.container = options.container
        this.icon = options.icon
        this.type = options.type
        this.render()
    }

    render() {
        this.node = document.createElement('div')
        this.node.classList.add('kb-data-card')
        let iconNode = document.createElement('div')
        iconNode.classList.add('kb-data-card-icon')
        iconNode.innerHTML = `
            <span class="fa-stack fa-2x">
                <span class="fa fa-${this.icon.shape} fa-stack-2x" style="color: ${this.icon.color}"></span>
                <span class="fa fa-inverse fa-stack-1x ${this.icon.icon}"></span>
            </span>
        `
        this.node.appendChild(iconNode)

        let infoNode = document.createElement('div')
        infoNode.classList.add('kb-data-card-info')
        infoNode.innerHTML = `
            <a style="font-weight: bold; font-size: 11pt; color: #2e618d;" href="https://ci.kbase.us/#dataview/${this.data[0]}">${this.data[1]}</a>
            <div style="padding-left: 10px">
                <div>${this.type}</div>
                <div>${readableTimestamp(this.data[3])}</div>
            </div>
        `
        this.node.appendChild(infoNode)

        this.container.appendChild(this.node)
        console.log(this.icon)
    }

}

/**
 * Converts a timestamp to a simple string.
 * Do this American style - HH:MM:SS MM/DD/YYYY
 *
 * @param {string} timestamp - a timestamp in number of milliseconds since the epoch, or any
 * ISO8601 format that new Date() can deal with.
 * @return {string} a human readable timestamp
 */
function readableTimestamp (timestamp) {
    if (!timestamp) {
        timestamp = 0
    }
    let format = function (x) {
        if (x < 10)
            x = '0' + x
        return x
    }

    const d = parseDate(timestamp),
        hours = format(d.getHours()),
        minutes = format(d.getMinutes()),
        seconds = format(d.getSeconds()),
        month = d.getMonth() + 1,
        day = format(d.getDate()),
        year = d.getFullYear()

    return hours + ':' + minutes + ':' + seconds + ', ' + month + '/' + day + '/' + year
}

/**
 * VERY simple date parser.
 * Returns a valid Date object if that time stamp's real.
 * Returns null otherwise.
 * @param {String} time - the timestamp to convert to a Date
 * @returns {Object} - a Date object or null if the timestamp's invalid.
 */
function parseDate (time) {
    /**
     * Some trickery here based on this StackOverflow post:
     * http://stackoverflow.com/questions/1353684/detecting-an-invalid-date-date-instance-in-javascript
     *
     * Try to make a new Date object.
     * If that fails, break it apart - This might be caused by some issues with the typical ISO
     * timestamp style in certain browsers' implementations. From breaking it apart, build a
     * new Date object directly.
     */
    let d = new Date(time)
    if (Object.prototype.toString.call(d) !== '[object Date]' || isNaN(d.getTime())) {
        var t = time.split(/[^0-9]/)
        // if t[0] is 0 or empty string, then just bail now and return null. This means that the
        // given timestamp was not valid.
        if (!t[0]) {
            return null
        }
        while (t.length < 7) {
            t.push(0)
        }
        d = new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5], t[6])
        // Test the new Date object
        if (Object.prototype.toString.call(d) === '[object Date]') {
            // This would mean its got the 'Invalid Date' status.
            if (isNaN(d.getTime())) {
                return null
            }
            else {
                d.setFullYear(t[0])
                return d
            }
        }
        return null
    }
    else {
        return d
    }
}


function selectTab(tabId) {
    // get the tab and panel, make sure they're real.
    const tab = document.querySelector('.kbs-tabs [href="#' + tabId + '"]').parentElement
    if (tab.classList.contains('active')) {
        return
    }
    const tabPanel = document.querySelector('.tab-content [id="' + tabId + '"]')
    if (tab && tabPanel) {
        // set all tabs inactive, activate given tab.
        document.querySelectorAll('.kbs-tabs > li').forEach(node => node.classList.remove('active'))
        tab.classList.add('active')
        // set all tabPanels inactive, activate given one.
        document.querySelectorAll('.tab-content[id="notebook-container"] > div[role="tabpanel"]').forEach((node) => {
            node.classList.remove('active')
            node.classList.add('kbs-is-hidden')
        })
        tabPanel.classList.add('active')
        tabPanel.classList.remove('kbs-is-hidden')
    }
}

function toggleAppView(btn) {
    const appIdx = btn.dataset.idx
    const id = 'app-' + appIdx
    const view = btn.dataset.view
    document.querySelectorAll('div[id^="' + id + '"]').forEach(node => {
        node.hidden = true
    })
    document.querySelectorAll('button.app-view-toggle[data-idx="' + appIdx + '"]').forEach(node => {
        node.classList.remove('selected')
    })
    document.querySelector('div[id^="' + id + '-' + view + '"]').hidden = false
    btn.classList.add('selected')
}

/**
 * Initializes the buttons, tabs, and reports for a static narrative.
 * @param {string} servWizardUrl - full url for the service wizard
 */
function initStaticNarrative(servWizardUrl, dataUrl) {
    let fileSetServUrl = null,
        lastFSSUrlLookup = 0,
        dataBrowser = null

    /**
     * Fetches the HTMLFileSetServ (HTML File set service) url from the service wizard.
     * This is used to set up the report iframes and links out to report documents and files.
     * It'll likely only be used once, but it's cached for 5 minutes just in case.
     * @param {string} servWizardUrl
     */
    function getFileServUrl(servWizardUrl) {
        const now = new Date()
        const fiveMin = 300000  // 5 minutes in ms
        if (fileSetServUrl == null || now.getTime() > lastFSSUrlLookup + fiveMin) {
            return fetch(servWizardUrl, {
                method: 'POST',
                mode: 'cors',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    method: 'ServiceWizard.get_service_status',
                    params: [{
                        module_name: 'HTMLFileSetServ',
                        version: null
                    }],
                    version: '1.1',
                    id: String(Math.random()).slice(2)
                })
            })
            .then(response => response.json())
            .then((res) => {
                fileSetServUrl = res.result[0].url
                return fileSetServUrl
            })
        }
        else {
            return new Promise((resolve) => {
                resolve(fileSetServUrl)
            })
        }
    }

    /* Now the meat of the process. Broken down into 4 steps.
     * 1. Get the HTML File server url, find all divs that carry a file path attribute (data-path),
     *    and use that to build and append an iframe inside them. This also creates the link to
     *    the standalone separate pages for the reports.
     */
    getFileServUrl(servWizardUrl)
        .then((fssUrl) => {
            document.querySelectorAll('div[data-kbreport]').forEach((node) => {
                const reportUrl = fssUrl + node.dataset.kbreport
                const iframe = document.createElement('iframe')
                iframe.setAttribute('id', 'iframe-' + String(Math.random()).slice(2))
                iframe.classList.add('kb-app-report-iframe')
                node.querySelector('a').setAttribute('href', reportUrl)
                node.querySelector('div.kb-app-report').appendChild(iframe)
                iframe.setAttribute('src', reportUrl)
            })
            document.querySelectorAll('ul.kb-report-link-list a').forEach((linkNode) => {
                let htmlPath = linkNode.getAttribute('href')
                linkNode.setAttribute('href', fssUrl + htmlPath)
            })
            document.querySelectorAll('ul.kb-report-file-list a').forEach((linkNode) => {
                linkNode.addEventListener('click', (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    const iframeId = linkNode.dataset.target,
                        fileName = linkNode.dataset.name,
                        srcUrl = linkNode.dataset.src,
                        m = srcUrl.match(/\/node\/(.+)$/)
                    let reportFileUrl = dataUrl
                    if (m) {
                        let query = {
                            id: m[1],
                            wszip: 0,
                            name: fileName
                        }
                        let queryString = Object.keys(query).map((key) => {
                            return [key, query[key]]
                                .map(encodeURIComponent)
                                .join('=')
                        })
                        .join('&')
                        reportFileUrl += '/download?' + queryString
                    }
                    document.querySelector('iframe#' + iframeId).setAttribute('src', reportFileUrl)
                })
            })
        })

    /* 2. Initialize the click events attacthed to the main tabs. Calls selectTab on the
     *    clicked tab.
     */
    document.querySelectorAll('.kbs-tabs a').forEach((node) => {
        node.addEventListener('click', (e) => {
            e.preventDefault()
            selectTab(node.getAttribute('href').slice(1))
        })
    })

    /* 3. Set up the data browser to load itself only after shown. A little lazy-loading here.
     *    Specifically, it sets up the data browser (once) after the data tab has been clicked.
     */
    document.querySelector('a[href="#kbs-data"]').addEventListener('click', event => {
        if (!dataBrowser) {
            dataBrowser = new DataBrowser({
                node: document.querySelector('div#kbs-data'),
                dataFile: 'data.json'
            })
        }
    })

    /* 4. Set up app cell tab click events - toggle between the "View Configure" and "Result" tabs.
     */
    document.querySelectorAll('button.app-view-toggle').forEach((node) => {
        node.addEventListener('click', (e) => {
            toggleAppView(node)
        })
    })
}
