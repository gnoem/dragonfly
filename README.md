# dragonfly

A simple browser app for composing, editing, and organizing rich text notes.

Built with:
- Node.js
- Express
- React
- MongoDB using Mongoose
- JWT for user authentication
- [Draft.js](https://draftjs.org/)

<img src="https://ngw.dev/images/portfolio/dragonfly.png" alt="dragonfly preview" />

## Try it out

View it live at [this link](https://ngwdragonfly.herokuapp.com/). Note: This project is hosted on Heroku's free tier and may initially take up to 30 seconds to load depending on how much traffic it's gotten in the last half hour. Thanks for your patience!

## Overview

### General functionality

- To get started, create an account associated with an auto-generated *public* dashboard URL. To password-protect your notes you can finalize your account registration by signing up with a valid email address.
- Create/read/update/delete collections and tags
- Create/read/update/delete rich text notes using the [Draft.js](https://draftjs.org/)-powered editor
  - "Star" notes
  - Organize notes: Move notes into collections and add tags to notes for easy filtering. A note can only belong to one collection at a time but can have multiple tags.
  - Move notes to and from the Trash folder
- Filter notes by tag. If multiple tags are selected, you can customize your search by choosing whether you want to view notes containing *all* of the selected tags or *any* of the selected tags.

## Note to self

- [ ] Rearrange tags and collections
- [ ] Search function asap!