const anime = require('animejs');

module.exports = class SmoothScroll {
    el; scroll; width;

    constructor(el) {
        this.el = el;
        this.width = this.el.offsetWidth;
        this.scroll = 0;
    }

    init() {
        window.addEventListener('resize', event => {
            this.width = this.el.offsetWidth;
            this.scroll = 0;
        })

        this.el.addEventListener('wheel', event => {
            if(event.deltaY < 0) {
                if(this.scroll > 0) this.scroll += event.deltaY;
            } else if (event.deltaY > 0) {
                if(this.scroll < this.width - window.innerWidth) this.scroll += event.deltaY;
            }
            anime.remove('.news')
            anime({
                targets: '.news',
                translateX: -this.scroll,
                easing: 'easeOutQuad',
            })
        })
    }
}