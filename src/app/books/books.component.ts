import { Component, OnInit } from '@angular/core';

import { GoogleBooksService } from "./books.service";

import { FavoritoService } from "./favorito.service";

declare  var $:any;

@Component({
    selector: 'books',
    templateUrl: './books.component.html'
})
export class BooksComponent implements OnInit {
    constructor(private googleBooksService: GoogleBooksService, private favoritoService: FavoritoService) { }
    q;
    books;
    pagina;
    total;
    atualScroll;

    ngOnInit() { }

    private destacarBusca(q, texto) {
        let query: string = "";
        let arrayCharacter = q.toLowerCase().split('')
        for (let letra of arrayCharacter) {
            if (letra === 'a') {
                query += "[aAáÁâÂàÀäÄãÃ]";
            } else if (letra === 'e') {
                query += "[eEéÉêÊèÈëË]";
            } else if (letra === 'i') {
                query += "[iIíÍîÎìÌïÏ]";
            } else if (letra === 'o') {
                query += "[oOóÓôÔòÒöÖõÕ]";
            } else if (letra === 'u') {
                query += "[uUúÚûÛùÙüÜ]";
            } else if (letra === 'c') {
                query += "[cCçÇ]";
            } else {
                query += letra;
            }
        }

        return texto.replace(new RegExp(query, "ig"),
            function (x) {
                return "<b>" + x + "</b>"
            }
        );
    }

    search(q) {
        let vm = this;
        this.pagina = 0;
        this.total = this.total ? this.total : 10;
        this.q = q;
        this.find().subscribe(
            books => {
                vm.books = books;
            }
            );
    }

    private find() {
        let vm = this;

        return this.googleBooksService.find(this.q, this.pagina * this.total, this.total).map(function (dados) {
            if (dados && dados["items"]) {
                for (let book of dados["items"]) {

                    if (book.volumeInfo.title) {
                        book.volumeInfo.title = vm.destacarBusca(vm.q, book.volumeInfo.title);
                    }
                    if (book.volumeInfo.description) {
                        book.volumeInfo.description = vm.destacarBusca(vm.q, book.volumeInfo.description);
                    }
                }
            }
            return dados;
        });
    }

    favoritar(book) {
        if (this.isFavorito(book)) {
            this.favoritoService.removeFavorito(book);
        } else {
            this.favoritoService.setFavorito(book);
        }

    }

    isFavorito(book) {
        return this.favoritoService.isFavorito(book.id);
    }

    /*getPages(pageAtual, totalPorPage, length) {
        let pages = [];
        for (let i = 0; i < length; i++) {
            if ((i + 1) % totalPorPage == 0) {
                let page = {};
                page["numero"] = Math.floor((i + 1) / totalPorPage);
                page["start"] = (i + 1);
                pages.push(page);
            }
        }
        return pages;
    }*/

    onScroll(event) {
        let vm = this;
        if (this.books.totalItems > (this.pagina+1*this.total ) && $(document).height() - $(window).height() == $(window).scrollTop() && this.atualScroll != $(window).scrollTop()) {
            this.atualScroll = $(window).scrollTop()
            
            ++this.pagina
            this.find().subscribe(
            books => {
                console.log(vm.books);
                vm.books.items = vm.books.items.concat(books["items"]);
            }
            );
        }
    }


}