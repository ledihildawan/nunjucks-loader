/* globals __USE_ES__ */

import path from 'path';

import compiler from './compiler';

const loaderOptions = {
    esModule: __USE_ES__
};

describe('Assets', function() {
    test('should load static assets', async function() {
        const output = await compiler('fixtures/assets/template.njk', loaderOptions, {
            resolve: {
                alias: {
                    '@assets': path.join(__dirname, 'fixtures/assets'),
                    '@static': path.join(__dirname, 'fixtures/django_project/app_example/static')
                }
            }
        });

        await expect(output()).resolves.toMatchSnapshot();
    });

    test('should load exported static assets', async function() {
        const output = await compiler('fixtures/assets/template-as.njk', loaderOptions, {
            resolve: {
                alias: {
                    '@assets': path.join(__dirname, 'fixtures/assets'),
                    '@static': path.join(__dirname, 'fixtures/django_project/app_example/static')
                }
            }
        });

        await expect(output()).resolves.toMatchSnapshot();
    });

    test('should load dynamic assets', async function() {
        const output = await compiler('fixtures/assets/dynamic.njk', loaderOptions, {
            resolve: {
                alias: {
                    '@assets': path.join(__dirname, 'fixtures/assets'),
                    '@static': path.join(__dirname, 'fixtures/django_project/app_example/static')
                }
            }
        });

        await expect(output()).resolves.toMatchSnapshot();
    });

    test('should load dynamic assets with trailing slashes', async function() {
        const output = await compiler('fixtures/assets/dynamic-trailing-slash.njk', loaderOptions, {
            resolve: {
                alias: {
                    '@assets': path.join(__dirname, 'fixtures/assets'),
                    '@static': path.join(__dirname, 'fixtures/django_project/app_example/static')
                }
            }
        });

        await expect(output()).resolves.toMatchSnapshot();
    });

    test('should load exported dynamic assets', async function() {
        const output = await compiler('fixtures/assets/dynamic-as.njk', loaderOptions, {
            resolve: {
                alias: {
                    '@assets': path.join(__dirname, 'fixtures/assets'),
                    '@static': path.join(__dirname, 'fixtures/django_project/app_example/static')
                }
            }
        });

        await expect(output()).resolves.toMatchSnapshot();
    });

    it('should load variables', async function() {
        const output = await compiler('fixtures/assets/dynamic-variable.njk', loaderOptions, {
            resolve: {
                alias: {
                    '@assets': path.join(__dirname, 'fixtures/assets'),
                    '@static': path.join(__dirname, 'fixtures/django_project/app_example/static')
                }
            }
        });

        await expect(output()).resolves.toMatchSnapshot();
    });
});
