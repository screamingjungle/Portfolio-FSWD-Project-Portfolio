# ZURB Template

This website uses the [ZURB Foundation for Sites v6 Template](http://foundation.zurb.com/sites) to deliver static code. It has a Gulp-powered build system with these features:

- Handlebars HTML templates with Panini
- Sass compilation and prefixing
- JavaScript concatenation
- Built-in BrowserSync server
- For production builds:
  - CSS compression
  - JavaScript compression
  - Image compression


## Installation

To use this template, your computer needs:

- [NodeJS](https://nodejs.org/en/) (0.12 or greater)
- [Git](https://git-scm.com/)
- ImageMagick (or graphicsMagic) for image processing

### Manual Setup

Install the needed dependencies:

```bash
npm install
bower install
```

Finally, run `npm start` to run Gulp. Your finished site will be created in a folder called `dist`, viewable at this URL:

```
http://localhost:8000
```

To create compressed, production-ready assets, run `npm run build --production`.


### Featured Work data

A json file stores the information to build this partial section.
Json is stored in /src/data/portfolio.json
Partial is stored in /src/partial/portfolio.html

Images are created offline and stored in /src/assets/portfolio
They should be the same name of the name seen in the json data.

JSON Example:
```
[{"id":1,"name":"myFabulous-Website","html_url":"https://github.com","description":"Portfolio Website","language":"HTML","Skills":"Zurb Foundation for Sites v6, Gulp, SASS"}]
```

### Github Repos data

The following command fetches details about your repositories. Names starting with "Portfolio" will be inserted into the page.

```bash
gulp github
```

The Requested data is saved in:
```
/src/data/github.json
```

The following partial is used to build the Github articles: 
```
/src/partial/github.html
```

Edit the handle in
```
/config.yml
```

### Portfolio Images

Images are created offline and stored in /src/assets/portfolio
The filename should be the same as the "name" seen in the json data. (this is taken from Github which does not use whitespace in the name, so DON'T use whitespace).

Images are resized in the build run to the following dimensions: 150,320,480,768,1200
E.g. /dist/assets/img/portfolio/1200/screenshot.jpg

The images are referenced in the following files while building the articles:
```
/src/partials/portfolio.html
/src/partials/github.html
```