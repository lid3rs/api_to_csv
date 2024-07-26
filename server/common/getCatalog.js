import ObjectsToCsv from 'objects-to-csv';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import config from 'config';

let saveFilePath = path.join(__dirname, config.get('paths.saveFilePath'), 'products.csv');

const getCatalog = async () => {
    // Maximum databse ~ 20351 products;

    // Remove old csv on every launch
    if (fs.existsSync(saveFilePath)) fs.unlinkSync(saveFilePath);

    function getRandomArbitrary(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    // Set maximum step Limit to request from API, small is optimal not to overload memory
    // const step = getRandomArbitrary(20, 30);
    const step = getRandomArbitrary(20, 30);

    let tempOffset = 0;
    let tempLimit = step;

    // Launching part-download
    let productsArrayFromResponse = [];
    let productNumber = 1;

    let i = 0;
    do {
        const limits = {
            Offset: tempOffset,
            Limit: tempLimit
        };

        const response = await getData(`${config.get('url.api')}/GetProducts`, limits).catch(err => {
            console.log(err);
            throw err;
        });

        productsArrayFromResponse = response.Products;

        await dataToCsv(productsArrayFromResponse).catch(err => {
            throw err;
        });
        tempOffset = tempOffset + step;
        i++;
    } while (productsArrayFromResponse.length > 0 /* && i === 1 */ && process.env.NODE_ENV === 'production');

    async function dataToCsv(productsArrayFromResponse) {
        let data = [];
        let i = 0;
        for (let index = 0; index < productsArrayFromResponse.length; index++) {
            const product = productsArrayFromResponse[index];
            for (const key in product) {
                if (key === 'PID') {
                    const pid = product['PID'];
                    // console.log(pid);
                    const productData = await getData(`${config.get('url.api')}/GetProduct`, {
                        ProductId: pid
                    });
                    let productColumns = {};

                    for (const key in productData.Product) {
                        const columns = [
                            'MPN',
                            'EAN',
                            'Name',
                            'Producer',
                            'Price',
                            'Stocks',
                            'EOLSale',
                            'Warranty',
                            'Branches',
                            'Medias',
                            'Title',
                            'Description',
                            'LinkText',
                            'Parameters'
                        ];
                        if (columns.includes(key)) {
                            function productColumnsRecorder(prop, val) {
                                productColumns = {
                                    ...productColumns,
                                    [prop]: val
                                };
                            }

                            switch (key) {
                                case 'Producer':
                                    productColumnsRecorder('Producer Name', productData.Product.Producer.Name);
                                    break;
                                case 'Price':
                                    productColumnsRecorder('Price Value', productData.Product.Price.Value);
                                    break;
                                case 'Stocks':
                                    (() => {
                                        let WhAmount = 0;
                                        for (const key in productData.Product.Stocks) {
                                            if (productData.Product.Stocks[key]['Amount'] > WhAmount) {
                                                WhAmount = productData.Product.Stocks[key]['Amount'];
                                            }
                                        }
                                        productColumnsRecorder('Stock Amount', WhAmount);
                                    })();
                                    break;
                                case 'Branches':
                                    (() => {
                                        let branches = [];
                                        for (const key in productData.Product.Branches) {
                                            branches.push(productData.Product.Branches[key]['Name']);
                                        }
                                        productColumnsRecorder('Branches', branches.join(', '));
                                    })();
                                    break;
                                case 'Medias':
                                    (() => {
                                        const spacer = key => {
                                            productColumnsRecorder(`Image_${key}`, '');
                                            // productColumnsRecorder(`Image_${key} Order`, '');
                                        };
                                        for (let key = 0; key <= 5; key++) {
                                            const objKey = productData.Product.Medias[key];
                                            if (objKey) {
                                                if (objKey.OriginalUri.endsWith('original.jpg')) {
                                                    productColumnsRecorder(`Image_${key}`, objKey.OriginalUri);
                                                    // productColumnsRecorder(`Image_${key} Order`, objKey.Order);
                                                    // productColumnsRecorder(`Image_${key} Title`, objKey.Title);
                                                    // productColumnsRecorder(`Image_${key} Description`, objKey.Description);
                                                    // productColumnsRecorder(`Image_${key} LinkText`, objKey.LinkText);
                                                } else {
                                                    spacer(key);
                                                }
                                            } else {
                                                spacer(key);
                                            }
                                        }
                                    })();
                                    break;
                                case 'Parameters':
                                    (() => {
                                        let parameterString = '';
                                        for (const key in productData.Product.Parameters) {
                                            const parameter = productData.Product.Parameters[key];

                                            const onlyParameters = ['ParameterName', 'Value', 'MeasureAbbr'];

                                            for (const key in parameter) {
                                                if (onlyParameters.includes(key)) {
                                                    if (parameter[key] !== null) {
                                                        parameterString = parameterString + `"${parameter[key]}"` + ',';
                                                    }
                                                }
                                            }
                                            parameterString = parameterString.replace(/.$/, ';');
                                        }
                                        return productColumnsRecorder('Parameters', parameterString);
                                    })();
                                    break;
                                default:
                                    productColumnsRecorder(key, productData.Product[key]);
                                    break;
                            }
                        }
                    }
                    data.push(productColumns);
                    process.send({ mpn: product['MPN'], nr: productNumber });
                }
            }
            productNumber++, i++;
        }

        let csv = new ObjectsToCsv(data);

        if (fs.existsSync(saveFilePath)) {
            return await csv.toDisk(saveFilePath, { append: true });
        } else {
            return await csv.toDisk(saveFilePath);
        }
    }

    process.send({
        success: 'Data succesfully downloaded!',
        link: saveFilePath
    });
};

async function getData(url, request) {
    return await axios
        .post(
            url,
            {
                request: {
                    ...config.get('api'),
                    ...request
                }
            },
            {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            }
        )
        .then(response => {
            return response.data;
        })
        .catch(error => {
            throw error.message;
        });
}

getCatalog().catch(err => process.send({ error: err }));
