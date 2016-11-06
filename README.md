## Synopsis

The problem statement was to find all links present on medium.com with the restriction that not more than 5 requests are made per second (so as to not spam their servers).
It also has to generate the csv file with the link. The api without async library generates ```links.csv``` while the one with async library generates ```asyncLinks.csv```.
It find all the links that point to medium.com only, not that link to other websites but enabling that won't be a major thing provided it doesn't needs to be scraped. There are two api's made, one that uses async library and one that doesn't.

## Installation

1) Clone the repository
2) Run ``` npm install ```
3) After installation is complete, start the server with ``` npm start ```

## API Reference

Currently there are two API endpoints:

1) ``` localhost:3000/scraper ```
2) ``` localhost:3000/asyncScraper ```


## License

NONE
