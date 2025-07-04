# StaticBlog

Project Angular CLI: 17.3.17
Node: 18.20.6
Package Manager: npm 10.8.2
OS: win32 x64
Package                         Version
---------------------------------------------------------
@angular-devkit/architect       0.1703.17
@angular-devkit/build-angular   17.3.17
@angular-devkit/core            17.3.17
@angular-devkit/schematics      17.3.17
@angular/cli                    17.3.17
@angular/material               20.0.5
@schematics/angular             17.3.17
rxjs                            7.8.2
typescript                      5.4.5
zone.js                         0.14.10


## Project Setup

### Instructions
Install Node.js and npm.
Install Angular CLI globally: npm install -g @angular/cli.
Install project dependencies:
npm install
npm install gray-matter
npm install marked ngx-markdown
npm install highlight.js


Run ng serve for a development server. Navigate to http://localhost:4200/
Run ng build to build the project. 


## Example Blog Posts



## Project Features
- Blog Post Handling:  Using the marked npm package, it facilitates the creation, editing, and rendering of blog posts written in Markdown.
- User can load all markdown files from : Local assets/posts directory + A public github repoo ( including parsefrontmatter metadata ) 
- Syntax Highlighting: highlight.js is used to style code blocks in blog entries.
- A list of every blog post, complete with titles, summaries, and metadata, is displayed on the blog list page.
- Full Post Viewer Page: Provides formatted Markdown content for individual blog posts with Syntax Highlighting feature including embedded image rendering && Estimated Reading time.
- Search Bar USING Tags / Authors / Title =.
- Filter: Choose Filter: By Tags / Authors / Date Range
- Track View Count: Keeps track of and shows how many views each blog post has received.
- The Light/Dark Mode Toggle System.
- Comment System: Allows readers to post comments on blog entries.
- Load MD Files from GITHUB REPO using GITHUB API.
- Generation OF RSS Feed: Creates an RSS feed for syndication automatically from blog entries(XML FORRMAT ).
