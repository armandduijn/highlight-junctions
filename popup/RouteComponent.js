export default class RouteComponent {
    constructor(id, name, visible) {
        this.id = id;
        this.name = name;
        this.visible = visible;
    }

    render() {
        return `
        <li>
            <div class="name">
                <a href="#" x-click="onClick" title="Bekijk deze route in een nieuw venster">${this.name}</a>
            </div>
            <span class="visible">
                <input type="checkbox" x-change="onChange" data-id="${this.id}" ${this.visible ? 'checked': ''} />
            </span>
        </li>
        `;
    }

    onClick() {
        chrome.tabs.create({
            url: `https://www.route.nl/fietsroute/${this.id}`
        });
    }

    onChange(event) {
        storage.update(this.id, { visible: event.target.checked });
    }
}