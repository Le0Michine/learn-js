const ROUTES = [
    { url: '/', templateUrl: '/src/templates/home.html' },
    { url: '/sign-in', templateUrl: '/src/templates/sign-in.html' },
    { url: '/sign-up', templateUrl: '/src/templates/sign-up.html' }
];

wd.createRoot('app')
    .routes(ROUTES)
    // .component('Link', {
    //     template: '<a href="{href}">{label}</a>',
    //     beforeMount: function (app, template) {
    //         return template;
    //     }
    // });

const data = ['one', 'two', 'three', 'four', 'five'];

wd.createRoot('header')
    .routes([{ url: '*', templateUrl: '/src/templates/header.html' }])
    .component('router-link', {
        template: '<a route href="{href}">{label}</a>',
        beforeMount: function (app, element, data) {
            element.setAttribute('href', data.href);
            element.innerHTML = data.innerHTML;
            return element;
        }
    }).component('search', {
        template: '<input type="text">',
        beforeMount: function (app, element, data) {
            element.setAttribute('class', data.class);
            element.setAttribute('placeholder', data.placeholder);
            let aw;
            setTimeout(() => aw = createAutocomplete(element), 0);
            element.addEventListener('input', (event) => onInput(event, aw), true);
            
            return element;
        }
    });

    function createAutocomplete(element) {
        return new Awesomplete(element, {
            filter: (text, input) => true
        });
    }

    function onInput(event, awesomplete) {
        fetch(`http://127.0.0.1:4200/api/search?query=${event.target.value}`, { method: 'post' }).then((response) => {
            if (response.ok) {
                response.json().then(result => {
                    awesomplete._list = result;
                    awesomplete.evaluate();
                });
            }
        }).catch((error) => {
            console.error(error);
        });
    }