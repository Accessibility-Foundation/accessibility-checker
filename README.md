# accessibility-checker
Validating website accessibility with @siteimprove/alfa

> :warning: **NOTE**
>
> This project is depending on unreleased code; [Site Improve's Alfa project](https://github.com/Siteimprove/alfa)

## Project setup

This project is a [NodeJS](https://nodejs.org/en/) one maintained with [Yarn dependency manager](https://yarnpkg.com/en/docs/getting-started) and node. Check out installation of NodeJS and yarn first before you continue. Installing NodeJs with [node version manager](https://github.com/creationix/nvm#installation) is prefered, to easily change node version.



---



## Installation

First time:

```shell
# Clone this repo
# https
git clone https://github.com/Accessibility-Foundation/accessibility-checker.git

# Or ssh
git clone git@github.com:Accessibility-Foundation/accessibility-checker.git

# Get into the project
cd accessibility-checker

# Use latest lts node version
nvm install

# Install packages with npm
npm install

# Build alfa and link alfa-packages to node_modules
# This will give you a moment to grab a coffee...
npm run alfa:build
```

Now you are ready to contribute…


---

## TODO

- [ ] Change reporting into ACT template

    ```json
    [
        {
            "id": "SIA_R3",
            "name": "wcag:parsing",
            "aspects": [
                "DOM Tree"
            ],
            "description": "This rule checks that all `id` attribute values on a single page are unique.",
            "scope": "HTML",
            "type": "atomic",
            "outcome": "inapplicable",
            "audits": [],
        },
        {
            "id": "SIA_R3",
            "name": "wcag:parsing",
            "applicability": "htmlElement.hasAttribute('id')",
            "description": "This rule checks that all `id` attribute values on a single page are unique.",
            "expectations": [
                {
                    "id": 1,
                    "description": "The id attribute is not empty",
                    "expectation": "htmlElement.getAttribute('id') !== ''",
                },
                {
                    "id": 2,
                    "description": "The id attribute is used only once",
                    "expectation": "document.querySelectorAll('#' + htmlElement.getAttribute('id')).length === 1",
                },
            ],
            "scope": "HTML",
            "type": "atomic",
            "outcome": "passed",
            "audits": {
                "passed": [
                    {
                        "target": "htmlElement",
                        "outcome": "passed",
                        "expectations": [
                            {
                                "id": 1,
                                "description": "The id attribute is not empty",
                                "expectation": "htmlElement.getAttribute('id') !== ''",
                                "outcome": "passed"
                            },
                            {
                                "id": 2,
                                "description": "The id attribute is used only once",
                                "expectation": "document.querySelectorAll('#' + htmlElement.getAttribute('id')).length === 1",
                                "outcome": "passed"
                            }
                        ],
                    }
                ],
            }
        },
        {
            "id": "SIA_R3",
            "name": "wcag:parsing",
            "applicability": "htmlElement.hasAttribute('id')",
            "description": "This rule checks that all `id` attribute values on a single page are unique.",
            "expectations": [
                {
                    "id": 1,
                    "description": "The id attribute contains at least 1 character",
                    "expectation": "htmlElement.getAttribute('id').length >= 1",
                },
                {
                    "id": 2,
                    "description": "The id attribute is used only once",
                    "expectation": "document.querySelectorAll('#' + htmlElement.getAttribute('id')).length === 1",
                },
            ],
            "scope": "HTML",
            "type": "atomic",
            "outcome": "failed",
            "audits": {
                "failed": [
                    {
                        "target": "htmlElement",
                        "outcome": "failed",
                        "expectations": [
                            {
                                "id": 1,
                                "outcome": "passed"
                            },
                            {
                                "id": 2,
                                "outcome": "failed"
                            }
                        ],
                    }
                ],
            },
        }
    ];
    ```
