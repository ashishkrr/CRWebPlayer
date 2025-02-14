
// Class that handles the playback of the whole book
import { Book, BookType, Page, TextElement, ImageElement, AudioElement  } from "../Models/Models";
import { Splide } from "@splidejs/splide";

export class PlayBackEngine {

    currentPage: number;
    numberOfPages: number;
    transitioningToPage: boolean;

    imagesPath: string;
    audioPath: string;

    emptyGlowImageTag: string = "empty_glow_image";

    splideHandle: Splide;

    currentBookType: BookType;

    constructor(imagesPath: string, audioPath: string) {
        this.imagesPath = imagesPath;
        this.audioPath = audioPath;
        this.currentPage = 0;
        this.splideHandle = new Splide('.splide', {
            fixedHeight: window.innerHeight - 20,
        }).mount();
        this.addPageResizeListener();
    }

    addPageResizeListener() {
        window.addEventListener('resize', () => {
            this.splideHandle.options.fixedHeight = window.innerHeight - 20;
            this.splideHandle.refresh();
        });
    }

    initializeBook(book: Book) {
        this.currentBookType = book.bookType;
        this.numberOfPages = book.pages.length;

        if (this.currentBookType === BookType.CuriousReader) {
            this.initializeCuriousReaderBook(book);
        } else if (this.currentBookType === BookType.GDL) {
            this.initializeGDLBook(book);
        }
    }

    initializeCuriousReaderBook(book: Book) {
        for (let i = 0; i < book.pages.length; i++) {
            const slide = document.createElement('li');
            slide.classList.add('splide__slide');

            // foreach visualelement in page add to slide
            for (let j = 0; j < book.pages[i].visualElements.length; j++) {
                let visualElement = book.pages[i].visualElements[j];
                if (visualElement.type == "text") {
                    let textElement: TextElement = visualElement;
                    let textElementDiv = document.createElement('div');

                    textElementDiv.classList.add('cr-text');
                    textElementDiv.style.position = "absolute";
                    textElementDiv.style.webkitTextStroke = "1px #303030";
                    textElementDiv.style.color = "#FFFFFF";
                    textElementDiv.style.textShadow = "0.1rem 0.15rem 0.1rem #303030";
                    textElementDiv.style.fontFamily = "Quicksand";
                    textElementDiv.style.fontWeight = "800";
                    textElementDiv.style.fontSize = "1.7em";
                    textElementDiv.style.top = textElement.positionY + "%";
                    textElementDiv.style.left = textElement.positionX + "%";
                    textElementDiv.style.width = textElement.width + "%";
                    textElementDiv.style.height = textElement.height + "%";
                    textElementDiv.innerHTML = textElement.textContentAsHTML;
                    slide.appendChild(textElementDiv);
                } else if (visualElement.type == "image") {
                    let imageElement: ImageElement = visualElement;

                    if (imageElement.imageSource === this.emptyGlowImageTag) {
                        continue;
                    }

                    let imageElementDiv = document.createElement('div');

                    imageElementDiv.classList.add('cr-image');
                    imageElementDiv.style.position = "absolute";
                    imageElementDiv.style.top = imageElement.positionY + "%";
                    imageElementDiv.style.left = imageElement.positionX + "%";
                    imageElementDiv.style.width = imageElement.width + "%";
                    imageElementDiv.style.height = imageElement.height + "%";

                    let imageElementImg = document.createElement('img');
                    imageElementImg.src = this.imagesPath + imageElement.imageSource.replace("images/", "");
                    imageElementImg.style.width = "100%";
                    imageElementImg.style.height = "100%";
                    imageElementDiv.appendChild(imageElementImg);
                    slide.appendChild(imageElementDiv);
                }

                this.splideHandle.add(slide);
            }
        }
    }

    initializeGDLBook(book: Book) {
        for (let i = 0; i < book.pages.length; i++) {
            const slide = document.createElement('li');
            slide.classList.add('splide__slide');

            // Add a flexbox container to the slide with a column layout
            let flexContainer = document.createElement('div');
            flexContainer.classList.add('gdl-flex-container');
            flexContainer.style.display = "flex";
            flexContainer.style.flexDirection = "column";
            flexContainer.style.justifyContent = "center";
            flexContainer.style.alignItems = "center";
            flexContainer.style.height = "100%";
            flexContainer.style.width = "100%";
            slide.appendChild(flexContainer);

            // foreach visualelement in page add to slide
            for (let j = 0; j < book.pages[i].visualElements.length; j++) {
                let visualElement = book.pages[i].visualElements[j];
                if (visualElement.type == "text") {
                    let textElement: TextElement = visualElement;
                    let textElementDiv = document.createElement('div');
                    textElementDiv.style.width = "60%";

                    textElementDiv.classList.add('gdl-text');
                    textElementDiv.style.webkitTextStroke = "1px #303030";
                    textElementDiv.style.color = "#FFFFFF";
                    textElementDiv.style.textShadow = "0.1rem 0.15rem 0.1rem #303030";
                    textElementDiv.style.fontFamily = "Quicksand";
                    textElementDiv.style.fontWeight = "800";
                    textElementDiv.style.fontSize = "1.7em";
                    textElementDiv.innerHTML = textElement.textContentAsHTML;
                    flexContainer.appendChild(textElementDiv);
                } else if (visualElement.type == "image") {
                    let imageElement: ImageElement = visualElement;

                    let imageElementDiv = document.createElement('div');
                    imageElementDiv.classList.add('gdl-image');

                    let imageElementImg = document.createElement('img');
                    imageElementImg.src = this.imagesPath + imageElement.imageSource.replace("images/", "");
                    imageElementImg.style.width = "100%";
                    imageElementImg.style.height = "100%";
                    imageElementDiv.appendChild(imageElementImg);
                    flexContainer.appendChild(imageElementDiv);
                }
            }

            this.splideHandle.add(slide);
        }
    }

    goToNextPage() {
        if (this.transitioningToPage) return;
        if (this.currentPage < this.numberOfPages) {
            this.currentPage++;
        }
        this.transitionToPage(this.currentPage);
    }

    goToPreviousPage() {
        if (this.transitioningToPage) return;
        if (this.currentPage > 0) {
            this.currentPage--;
        }
        this.transitionToPage(this.currentPage);
    }

    transitionToPage(pageNumber: number) {
        this.transitioningToPage = true;
    }
}