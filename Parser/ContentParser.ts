import { Book, BookType, Page, TextElement, ImageElement, AudioElement } from "../Models/Models";

export class ContentParser {

    imagesPath: string;
    audioPath: string;
    contentFilePath: string;

    contentJSON: any;

    emptyGlowImageTag: string = "empty_glow_image";

    constructor(contentFilePath: string) {
        this.contentFilePath = contentFilePath;
    }

    async parseBook (): Promise<Book> {
        return new Promise((resolve, reject) => {
            this.parseContentJSONFile().then((contentJSON) => {
                this.contentJSON = contentJSON;
                console.log("Content JSON file parsed!");
                console.log(this.contentJSON);

                let book: Book = {
                    pages: [],
                    bookType: this.determineBookType(),
                };

                book.pages = this.parsePages(book);

                resolve(book);
            }).catch((error) => {
                reject(error);
            });
        });
    }

    determineBookType(): BookType {
        if (this.contentJSON["presentation"] !== undefined) {
            return BookType.CuriousReader;
        } else if (this.contentJSON["chapters"] !== undefined) {
            return BookType.GDL;
        } else {
            return BookType.Unknown;
        }
    }

    parsePages(book: Book): Page[] {
        let pages: Page[] = [];

        if (book.bookType === BookType.CuriousReader) {
            let pagesJSON = this.contentJSON["presentation"]["slides"];
            let globalFillColor = this.contentJSON["presentation"]["globalBackgroundSelector"]["fillGlobalBackground"];
            for (let i = 0; i < pagesJSON.length; i++) {
                let pageJSON = pagesJSON[i];
                let page: Page = {
                    visualElements: [],
                    backgroundColor: globalFillColor,
                };
                page.visualElements = this.parsePageCR(pageJSON);
                pages.push(page);
            }
        } else if (book.bookType === BookType.GDL) {
            let pagesJSON = this.contentJSON["chapters"];
            let globalFillColor = "#FCFCF2";
            for (let i = 0; i < pagesJSON.length; i++) {
                let pageJSON = pagesJSON[i];
                let page: Page = {
                    visualElements: [],
                    backgroundColor: globalFillColor,
                }
                page.visualElements = this.parsePageGDL(pageJSON);
                pages.push(page);
            }
        } else {
            console.log("Unknown book type!");
        }

        return pages;
    }

    parsePageCR(pageJSON: any): any[] {
        let visualElements: any[] = [];
        let elementsJSON = pageJSON["elements"];
        for (let i = 0; i < elementsJSON.length; i++) {
            let libraryString: string = elementsJSON[i]["action"]["library"];
            if (libraryString.includes("AdvancedText")) {
                let textElement: TextElement = this.parseTextElementCR(elementsJSON[i]);
                visualElements.push(textElement);
            } else if (libraryString.includes("Image")) {
                let imageElement: ImageElement = this.parseImageElementCR(elementsJSON[i]);
                visualElements.push(imageElement);
            }
            // else if (libraryString.includes("Audio")) {
            //     let audioElement: AudioElement = this.parseAudioElement(elementsJSON[i]);
            //     visualElements.push(audioElement);
            // }
        }

        return visualElements;
    }

    parsePageGDL(pageJSON: any): any[] {
        let visualElements: any[] = [];
        let elementsJSONArray = pageJSON["params"]["content"];

        for (let i = 0; i < elementsJSONArray.length; i++) {
            let libraryString: string = elementsJSONArray[i]["content"]["library"];
            if (libraryString.includes("AdvancedText")) {
                let textElement: TextElement = this.parseTextElementGDL(elementsJSONArray[i]["content"]["params"]);
                visualElements.push(textElement);
            } else if (libraryString.includes("Image")) {
                let imageElement: ImageElement = this.parseImageElementGDL(elementsJSONArray[i]["content"]["params"]);
                visualElements.push(imageElement);
            }
        }

        return visualElements;
    }

    parseTextElementCR(elementJSON: any): TextElement {
        let textElement: TextElement = {
            type: "text",
            positionX: elementJSON["x"],
            positionY: elementJSON["y"],
            width: elementJSON["width"],
            height: elementJSON["height"],
            textContentAsHTML: elementJSON["action"]["params"]["text"],
        };

        return textElement;
    }

    parseTextElementGDL(elementJSON: any): TextElement {
        let textElement: TextElement = {
            type: "text",
            positionX: NaN,
            positionY: NaN,
            width: NaN,
            height: NaN,
            textContentAsHTML: elementJSON["text"],
        };
        return textElement;
    }

    parseImageElementCR(elementJSON: any): ImageElement {
        let path: string = ""; ;
        if (elementJSON["action"]["params"]["file"] === undefined) {
            path = this.emptyGlowImageTag;
        } else {
            path = elementJSON["action"]["params"]["file"]["path"];
        }
        let imageElement: ImageElement = {
            type: "image",
            positionX: elementJSON["x"],
            positionY: elementJSON["y"],
            width: elementJSON["width"],
            height: elementJSON["height"],
            imageSource: path,
        };

        return imageElement;
    }

    parseImageElementGDL(elementJSON: any): ImageElement {
        let imageElement: ImageElement = {
            type: "image",
            positionX: NaN,
            positionY: NaN,
            width: elementJSON["width"],
            height: elementJSON["height"],
            imageSource: elementJSON["file"]["path"],
        };
        return imageElement;
    }

    parseAudioElementCR(elementJSON: any): AudioElement {
        let audioElement: AudioElement = {
            type: "audio",
            positionX: elementJSON["position"]["x"],
            positionY: elementJSON["position"]["y"],
            width: elementJSON["size"]["width"],
            height: elementJSON["size"]["height"],
            audioSrc: elementJSON["action"]["audioSrc"],
            styles: elementJSON["styles"],
        };

        return audioElement;
    }

    async parseContentJSONFile(): Promise<any> {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', this.contentFilePath, true);
            xhr.responseType = 'json';
            xhr.onload = function () {
                let status = xhr.status;
                if (status === 200) {
                    let response = xhr.response;
                    delete response["l10n"];
                    delete response["override"];
                    resolve(response);
                } else {
                    reject(xhr.response);
                }
            };
            xhr.send();
        });
    }

}
