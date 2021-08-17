# Inquisitive Semantics Website

The site is built using Jekyll, and hosted using GitHub Pages.


## Basics

A quick overview of the basics techniques and concepts you need to understand
in order to maintain the website: markdown, YAML and Jekyll.

### Markdown

Markdown is a very simple markup language that can be used throughout the website. Cheatsheet:

```markdown
**boldface**, _italic_, [link text](https://domain.com)

* Unordered list item 1
* Unordered list item 2
* ...

1. Ordered list item 1
2. Ordered list item 2
3. ...

# Heading 1

## Heading 2

## Heading 3

A blank line indicates a paragraph break.

```

### YAML

YAML is a very flexible, human readable language for describing structured data
(similar to JSON or XML). It is used extensively: for data files in the
[_data directory](/_data), but also for (meta)data in Jekyll headers
(those are the initial section of documents delimited by three dashes `---`).
YAML cheatsheet:

```yaml
# Comments start with a #
# Indentation is important!

# Lists
my_list:
  - item 1
  - item 2
  - item 3
# or, equivalently:
my_list: [item 1, item 2, item 3]

# Objects
my_object:
  # Indentation indicates that we are inside the object
  key1: a string
  key2: "a string" # you can often omit (double) quotes...
  key3: "Title: a subtitle" # ... unless it contains a colon

  # Lists inside an object
  key3: 
    - item 3a
    - item 3b
  key4: [item 4a, item 4b]

  # Objects inside an object
  key5:
    key5a: value 5a
    key5b: value 5b

  # Longer text indicated by >
  key6: >
    This is a particularly long passage of text, spanning multiple
    lines. In Jekyll this will typically contain **markdown**.
  
  # Some other data types
  my_date: 2020-02-01
  my_number: 15
  another_number: 14.6

# You also define objects using curly brackets rather than indentation
# (just like in JSON), but this usually doesn't improve readability.
object2: { key1: 2, key2: "foo bar" }
```

### Jekyll

Jekyll is a static site generator: it takes a bunch of source files,
(markdown and YAML data files) combines them with html templates, 
to generate a directory with html files, images, etc. This directory
(called `_site`) is hosted on a server, with no involvement of databases etc.

Jekyll is often used for blogs, where pages are written in markdown.
Jekyll converts this to HTML, and plugs it into a html template to 
generate the page. We use that functionality for workshops and courses,
but also pull data from yaml files in the `_data` directory.

GitHub Pages can also generate Jekyll sites. This means that we don't
upload the compiled html site to github, but only the source files.
GitHub then generates the site and hosts it.

Jekyll processes all files that start with a **header**: a section
delimited by three dashes.

```markdown
---
# this is the YAML header with metadata
title: My title
subtitle: the subtitle

# this tells Jekyll which template file to use for rendering the HTML
layout: post 
---

Contents of the page, in this case: markdown.
```

You usually find those headers at the top of markdown files,
but also in some HTML files, or even the (s)css files.

### Liquid (only for development)

Liquid is the template language that is used by Jekyll to generate
populate the HTML files with actual text. 
The template files in `_layouts` extensively use Liquid, but **you 
don't need this when maintaining the website**. 
[Here you can find a useful cheatsheet](https://gist.github.com/JJediny/a466eed62cee30ad45e2), and below is a quick demo:

```html
<h1>{{ page.title }}</h1>

<div class="person">
{% for person in page.people %}
  <p>{{ person.first_name }}</p>
  <p>{{ person.last_name }}</p>
  {% if person.affiliation %}
  <p>Affiliation: {{ person.affiliation }}</p>
  {% endif %}
{% endfor %}
</div>
```

## Structure of the site

- **[`_data`](/_data)**: all YAML data files. There is some documentation in 
the comments at the top of every file.
- **[`_pages`](/_pages)**: all pages except pages for individual workshops and courses
- **[`_workshops`](/_workshops) and [`_courses`](/courses)**: these directories contain markdown files, one for each workshop/course.
- **[`_layouts`](_layouts) and [`_includes](_includes)**: contains the template
files that are used by Jekyll to generate the website. These are largely written
in Liquid and HTML. A _layout_ is used to generate a page, an _include_ is
usually a part of a layout that is reused multiple times (e.g. a card showing one person)
- **[`assets/`](/assets)**: Contains all publicly available files. These are (mostly) copied to the site. This in particular also contains all images and files (pdfs etc)

## Installing and using Jekyll locally

It is convenient to install Jekyll locally, so you can preview the change you make.
Follow [Jekyll's installation instructions](https://jekyllrb.com/docs/installation/macos/). Quick summary:

1. First we install [Homebrew](https://brew.sh), a package manager for macOS.
2. We then use Homebrew to install Ruby, the programming language in which Jekyll is written. In this way we don't have to use the version of ruby that macOS itself uses.
3. Then we use RubyGems (`gem`; a package manager for Ruby) to install [Jekyll](https://jekyllrb.com).
4. Jekyll is now installed somewhere in your home directory, and we need to make it available under the command `jekyll`. You do this by updating your 'path'.
5. Jekyll should now be available as the command `jekyll`.

Several things can go wrong:

* In step 4, make sure to use the right version number of Ruby when updating your path. 
* And in step 5, `jekyll serve` might not work because the gem `webrick` was not installed. Running `gem install webrick` solved that issue.

If the installation was successful:

```bash
# Navigate to your home directory (not necessary in Visual Code)
cd ~/Dropbox/Github/inquisitive-semantics

# Start the local webserver to make your site available at
# http://127.0.0.1:4000/inquisitive-semantics
# --livereload ensures the browser reloads whenever a file is changed
jekyll serve --livereload
```

## Questions or problems

Contact Bas Cornelissen via mail@bascornelissen.nl