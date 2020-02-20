const fs = require('fs');
const files = ['a_example', 'b_read_on'];
//, 'c_incunabula', 'd_tough_choices', 'e_so_many_books', 'f_libraries_of_the_world'
let absolutScore = 0;

for (let filePath of files) {
    console.log(filePath);

    const input = fs.readFileSync(filePath + '.txt', 'utf8').trim().split('\n');

    const mainDataRaw = input.shift().trim().split(' ');
    const books = input.shift().trim().split(' ');
    const bookRarity = {}


    const mainData = {
        bookCount: mainDataRaw[0],
        librarieCount: mainDataRaw[1],
        daysAvailable: mainDataRaw[2]
    }

    const librariesData = [];

    for (let index = 0; index < input.length; index += 2) {
        const rawLibrarieData = input[index].trim().split(' ');

        const librarieData = {
            bookCount: rawLibrarieData[0],
            signupTime: rawLibrarieData[1],
            shippingCount: rawLibrarieData[2]
        }

        const booksInLibrarie = input[index+1].trim().split(' ');
        const byScore = {};

        booksInLibrarie.forEach(book => {
            const score = books[book];
            bookRarity[book] ? bookRarity[book]++ : bookRarity[book] = 1;

            byScore[score] ?  byScore[score].push(book) : byScore[score] = [ book ];
        })

        librariesData.push({
            id: index/2,
            librarieDetails: librarieData,
            booksInLibrarie: booksInLibrarie,
            booksInLibrarieByScore: byScore
        })
    }



    const selectLibrarieToSignup = () => {
        const coolnesObject = {};

        for (let librarie of librariesData) {
            if (signedLibraries.indexOf(librarie.id) === -1) {
                const coolness = calcCoolnessFactor(librarie);
                
                coolnesObject[coolness] = librarie;
            }
        }

        const highestFactor = Object.keys(coolnesObject).sort((a, b) => parseInt(b) - parseInt(a))[0];
        
        return coolnesObject[highestFactor];
    }

    const scanBooks = (librarie) => {
        const librarieId = librarie.id;
        
        for(let index = 0; index < librarie.librarieDetails.shippingCount; index++) {
            const scoreArray = Object.keys(librarie.booksInLibrarieByScore).sort((a, b) => parseInt(b) - parseInt(a));
            
            let scoreIndex = 0;
            let book = null;

            while(!book && scoreIndex < scoreArray.length) {
                const score = scoreArray[scoreIndex];
                const bookIds = librarie.booksInLibrarieByScore[score];
                
                bookIds.forEach(bookId => {
                    if (scannedBooks.indexOf(bookId) === -1) {
                        book = bookId;
                    }
                })

                
                if (book === 0) {
                    delete librarie.booksInLibrarieByScore[score];
                }
                
                scoreIndex++;
            }

            if (book !== null) {
                scannedBooks.push(book);
                librarieOutput[librarieId].books.push(book);
            } else {
                break;
            }
        }

    }

    const calcCoolnessFactor = (librarie) => {
        let totalBookScore = 0;
        const viableBookScores = [];
        let rarestBook = 100;
        let totalRarity = 0;
        
        Object.keys(librarie.booksInLibrarieByScore).forEach(bookScore => {
            const bookIds = librarie.booksInLibrarieByScore[bookScore];

            bookIds.forEach(bookId => {
                if (scannedBooks.indexOf(bookId) === -1) {
                    totalBookScore += parseInt(bookScore);
                    viableBookScores.push(parseInt(bookScore));
                    
                    const rarity = bookRarity[bookId];
                    totalRarity += rarity;
                    if (rarity < rarestBook) {
                        rarestBook = rarity;
                    }
                }
            })
        })
        
        const averageBookScore = totalBookScore/viableBookScores.length;
        const highestBookScore = viableBookScores.sort((a, b) => parseInt(b) - parseInt(a))[0];
        
        const producitvity = librarie.librarieDetails.signupTime / librarie.librarieDetails.shippingCount;
        const averageRarity = totalRarity / viableBookScores.length;
        
        const coolness = (averageBookScore + highestBookScore) / (producitvity * averageRarity * rarestBook);
        
        return coolness;
        
    }

    let days = 0, scannedBooks = [], scanning = { days: 0, scannedLibrarie: null }, signedLibraries = [];

    let librarieOutput = {};

    while(days < parseInt(mainData.daysAvailable)) {
        for(let librarie of signedLibraries) {
            let librarieObject = librariesData[librarie]
            scanBooks(librarieObject);
        }
        if (scanning.days === 0) {
            const librarieToSignup = selectLibrarieToSignup();
            if (librarieToSignup) {
                scanning.days = parseInt(librarieToSignup.librarieDetails.signupTime)-1;
                scanning.scannedLibrarie = librarieToSignup;    

                if (scanning.days === 0) {
                    signedLibraries.push(scanning.scannedLibrarie.id);
                    librarieOutput[scanning.scannedLibrarie.id] = {
                        books: []
                    }        
                }
            }
        } else if (scanning.days === 1) {
            signedLibraries.push(scanning.scannedLibrarie.id);
            librarieOutput[scanning.scannedLibrarie.id] = {
                books: []
            }

            scanning.days--;
        } else {
            scanning.days--;
        }

        days++;
    }

    let scoreSum = 0;

    for(let book of scannedBooks) {
        scoreSum += parseInt(books[book]);
    }

    const output = [];

    output.push(signedLibraries.length + '');

    for(let librarie of signedLibraries) {
        const librarieData = librarieOutput[librarie];
        const line1 = librarie + ' ' + librarieData.books.length;
        const line2 = librarieData.books.join(' ');

        output.push(line1);
        output.push(line2);
    }

    fs.writeFileSync(filePath + '_result.txt', output.join('\n'));
    fs.writeFileSync(filePath + '_score.txt', scoreSum);

    absolutScore += scoreSum;
}

fs.writeFileSync('absolut_score.txt', absolutScore);