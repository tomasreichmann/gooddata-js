// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
import { range, find } from 'lodash';
import fetchMock from './utils/fetch-mock';
import { mockPollingRequest } from './helpers/polling';
import * as md from '../src/metadata';
import * as xhr from '../src/xhr';

describe('metadata', () => {
    describe('with fake server', () => {
        afterEach(() => {
            fetchMock.restore();
        });

        describe('getAttributes', () => {
            it('should reject with 400 from backend', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/query/attributes',
                    400
                );

                return md.getAttributes('myFakeProjectId').then(null, err => expect(err).to.be.an(Error));
            });

            it('should return correct number of entries', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/query/attributes',
                    { status: 200, body: JSON.stringify({ query: { entries: [{ title: 'a1' }, { title: 'a2' }] } }) }
                );

                return md.getAttributes('myFakeProjectId').then((result) => {
                    expect(result.length).to.be(2);
                });
            });
        });

        describe('createObject', () => {
            it('should return created object', () => {
                const newObj = {
                    metric: {
                        content: {},
                        meta: {}
                    }
                };

                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/obj?createAndGet=true',
                    {
                        status: 200,
                        body: JSON.stringify({
                            ...newObj
                        })
                    }
                );

                return md.createObject('myFakeProjectId', newObj).then((createdObj) => {
                    expect(createdObj).to.eql(newObj);
                });
            });
        });

        describe('etlPull', () => {
            const mockTask = status => ({
                wTaskStatus: {
                    status
                }
            });

            const finishedTask = mockTask('OK');
            const runningTask = mockTask('RUNNING');
            const etlUri = '/gdc/md/1/tasks/1/status';
            const triggerEtlResponse = {
                pull2Task: {
                    links: {
                        poll: etlUri
                    }
                }
            };

            describe('/gdc/md/1/etl/pull2 call successful', () => {
                function mockIntialPost() {
                    fetchMock.mock(
                        '/gdc/md/1/etl/pull2',
                        'POST',
                        {
                            status: 201,
                            body: JSON.stringify(triggerEtlResponse)
                        }
                    );
                }

                it('should poll until task status is OK', () => {
                    mockIntialPost();

                    mockPollingRequest(etlUri, runningTask, finishedTask);

                    return md.etlPull('1', '1', { pollStep: 1 }).then((result) => {
                        expect(result).to.eql(finishedTask);
                    });
                });
            });

            describe('/gdc/md/1/etl/pull2 call not successful', () => {
                it('should reject if task ends with error', () => {
                    fetchMock.mock(
                        '/gdc/md/1/etl/pull2',
                        'POST',
                        {
                            status: 400,
                            body: JSON.stringify({})
                        }
                    );

                    return md.etlPull('1', '1').then(() => {
                        expect().fail('Should reject the promise if task ends with error');
                    }, (err) => {
                        expect(err).to.be.an(Error);
                    });
                });
            });
        });

        describe('ldmManage', () => {
            const mockTask = status => ({
                wTaskStatus: {
                    status
                }
            });

            const finishedTask = mockTask('OK');
            const runningTask = mockTask('RUNNING');
            const manageStatusUri = '/gdc/md/1/tasks/1/status';
            const triggerLdmManageResponse = {
                entries: [
                    {
                        link: manageStatusUri
                    }
                ]
            };

            describe('/gdc/md/1/ldm/manage2 call successful', () => {
                function mockIntialPost() {
                    fetchMock.mock(
                        '/gdc/md/1/ldm/manage2',
                        'POST',
                        {
                            status: 200,
                            body: JSON.stringify(triggerLdmManageResponse)
                        }
                    );
                }

                it('should poll until task status is OK', () => {
                    mockIntialPost();

                    mockPollingRequest(manageStatusUri, runningTask, finishedTask);

                    return md.ldmManage('1', '1', { pollStep: 1 }).then((result) => {
                        expect(result).to.eql(finishedTask);
                    });
                });
            });

            describe('/gdc/md/1/ldm/manage2 call not successful', () => {
                it('should reject if task ends with error', () => {
                    fetchMock.mock(
                        '/gdc/md/1/ldm/manage2',
                        'POST',
                        {
                            status: 400,
                            body: JSON.stringify({})
                        }
                    );

                    return md.ldmManage('1', '1').then(() => {
                        expect().fail('Should reject the promise if task ends with error');
                    }, (err) => {
                        expect(err).to.be.an(Error);
                    });
                });
            });
        });

        describe('getDimensions', () => {
            it('should reject with 400 from backend', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/query/dimensions',
                    400
                );

                return md.getDimensions('myFakeProjectId').then(null, err => expect(err).to.be.an(Error));
            });

            it('should return correct number of entries', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/query/dimensions',
                    {
                        status: 200,
                        body: JSON.stringify({ query: { entries: [{ title: 'a1' }, { title: 'a2' }] } })
                    }
                );

                return md.getDimensions('myFakeProjectId').then((result) => {
                    expect(result.length).to.be(2);
                });
            });
        });

        describe('getFacts', () => {
            it('should reject with 400 from backend', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/query/facts',
                    400
                );

                return md.getFacts('myFakeProjectId').then(null, err => expect(err).to.be.an(Error));
            });

            it('should return correct number of entries', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/query/facts',
                    {
                        status: 200,
                        body: JSON.stringify({ query: { entries: [{ title: 'a1' }, { title: 'a2' }] } })
                    }
                );

                return md.getFacts('myFakeProjectId').then((result) => {
                    expect(result.length).to.be(2);
                });
            });
        });

        describe('getMetrics', () => {
            it('should reject with 400 from backend', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/query/metrics',
                    400
                );

                return md.getMetrics('myFakeProjectId').then(null, err => expect(err).to.be.an(Error));
            });

            it('should return correct number of entries', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/query/metrics',
                    {
                        status: 200,
                        body: JSON.stringify({ query: { entries: [{ title: 'a1' }, { title: 'a2' }] } })
                    }
                );

                return md.getMetrics('myFakeProjectId').then((result) => {
                    expect(result.length).to.be(2);
                });
            });
        });

        describe('getAvailableMetrics', () => {
            it('should reject with 400 from backend', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/availablemetrics',
                    400
                );

                return md.getAvailableMetrics('myFakeProjectId').then(null, err => expect(err).to.be.an(Error));
            });

            it('should return correct number of entries', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/availablemetrics',
                    {
                        status: 200,
                        body: JSON.stringify({ entries: [{ link: 'm1' }, { link: 'm2' }] })
                    }
                );

                return md.getAvailableMetrics('myFakeProjectId').then((result) => {
                    expect(result.length).to.be(2);
                });
            });
        });

        describe('getAvailableAttributes', () => {
            it('should reject with 400 from backend', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/drillcrosspaths',
                    400
                );

                return md.getAvailableAttributes('myFakeProjectId').then(null, err => expect(err).to.be.an(Error));
            });

            it('should return correct number of entries', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/drillcrosspaths',
                    {
                        status: 200,
                        body: JSON.stringify({ drillcrosspath: { links: [{ link: 'a1' }, { link: 'a2' }] } })
                    }
                );

                return md.getAvailableAttributes('myFakeProjectId').then((result) => {
                    expect(result.length).to.be(2);
                });
            });
        });

        describe('getAvailableFacts', () => {
            it('should reject with 400 from backend', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/availablefacts',
                    400
                );

                return md.getAvailableFacts('myFakeProjectId').then(null, err => expect(err).to.be.an(Error));
            });

            it('should return correct number of entries', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/availablefacts',
                    {
                        status: 200,
                        body: JSON.stringify({ entries: [{ link: 'm1' }, { link: 'm2' }] })
                    }
                );

                return md.getAvailableFacts('myFakeProjectId').then((result) => {
                    expect(result.length).to.be(2);
                });
            });
        });

        describe('getUrisFromIdentifiers', () => {
            it('should return array with identifiers and uris', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/identifiers',
                    'POST',
                    {
                        status: 200,
                        body: JSON.stringify({
                            identifiers: [{
                                uri: '/foo/bar',
                                identifier: 'attr.foo.bar'
                            }, {
                                uri: '/fuzz/buzz',
                                identifier: 'attr.fuzz.buzz'
                            }]
                        })
                    }
                );

                return md.getUrisFromIdentifiers('myFakeProjectId', ['attr.foo.bar'])
                    .then((result) => {
                        expect(result).to.eql(
                            [{
                                uri: '/foo/bar',
                                identifier: 'attr.foo.bar'
                            }, {
                                uri: '/fuzz/buzz',
                                identifier: 'attr.fuzz.buzz'
                            }]
                        );
                    });
            });
        });

        describe('getIdentifiersFromUris', () => {
            it('should return array with identifiers and uris', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/identifiers',
                    'POST',
                    {
                        status: 200,
                        body: JSON.stringify({
                            identifiers: [{
                                uri: '/foo/bar',
                                identifier: 'attr.foo.bar'
                            }, {
                                uri: '/fuzz/buzz',
                                identifier: 'attr.fuzz.buzz'
                            }]
                        })
                    }
                );

                return md.getIdentifiersFromUris('myFakeProjectId', ['/foo/bar'])
                    .then((result) => {
                        expect(result).to.eql(
                            [{
                                uri: '/foo/bar',
                                identifier: 'attr.foo.bar'
                            }, {
                                uri: '/fuzz/buzz',
                                identifier: 'attr.fuzz.buzz'
                            }]
                        );
                    });
            });
        });

        describe('getObjectUri', () => {
            it('should return uri when identifier exists', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/identifiers',
                    'POST',
                    {
                        status: 200,
                        body: JSON.stringify({
                            identifiers: [{
                                uri: '/foo/bar',
                                identifier: 'attr.foo.bar'
                            }]
                        })
                    }
                );

                fetchMock.mock('/foo/bar', {
                    status: 200,
                    body: JSON.stringify({ attribute: { meta: { uri: '/foo/bar/attr' } } })
                });

                return md.getObjectUri('myFakeProjectId', 'attr.foo.bar').then((result) => {
                    expect(result).to.be('/foo/bar/attr');
                });
            });

            it('should reject promise when identifier does not exist', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/identifiers',
                    'POST',
                    {
                        status: 200,
                        body: JSON.stringify({ identifiers: [] })
                    }
                );

                return md.getObjectUri('myFakeProjectId', 'foo.bar').then(null, err => expect(err).to.be.an(Error));
            });

            it('should return an attribute uri for a display form identifier', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/identifiers',
                    'POST',
                    {
                        status: 200,
                        body: JSON.stringify({ identifiers: [{
                            uri: '/foo/bar/label',
                            identifier: 'label.foo.bar'
                        }] })
                    }
                );

                fetchMock.mock('/foo/bar/label', {
                    status: 200,
                    body: JSON.stringify({
                        attributeDisplayForm: {
                            content: {
                                formOf: '/foo/bar'
                            },
                            meta: {
                                identifier: 'label.foo.bar',
                                uri: '/foo/bar/label',
                                title: 'Foo Bar Label'
                            }
                        }
                    })
                });

                fetchMock.mock('/foo/bar', {
                    status: 200,
                    body: JSON.stringify({ attribute: { meta: { uri: '/foo/bar/attr' } } })
                });

                return md.getObjectUri('myFakeProjectId', 'label.foo.bar').then((result) => {
                    expect(result).to.be('/foo/bar/attr');
                });
            });
        });

        describe('getObjectUsing', () => {
            let postSpy;

            const projectId = 'myFakeProjectId';
            const object = `/gdc/md/${projectId}/obj/1`;
            const types = ['firstType', 'secondType'];
            const using2Uri = `/gdc/md/${projectId}/using2`;

            const respondEntries = [{
                content: {},
                meta: {}
            }];

            beforeEach(() => {
                postSpy = sinon.spy(xhr, 'post');
            });

            afterEach(() => {
                postSpy.restore();
            });

            it('should load object dependencies', () => {
                fetchMock.mock(
                    using2Uri,
                    { status: 200, body: JSON.stringify({ entries: respondEntries }) }
                );

                return md.getObjectUsing(projectId, object, { types }).then((result) => {
                    expect(postSpy.calledWith(using2Uri, {
                        data: JSON.stringify({
                            inUse: {
                                uri: object,
                                types,
                                nearest: 0
                            }
                        })
                    })).to.be(true);
                    expect(result).to.eql(respondEntries);
                });
            });

            it('should be properly called with nearest when requested', () => {
                fetchMock.mock(
                    using2Uri,
                    { status: 200, body: JSON.stringify({ entries: respondEntries }) }
                );

                const nearest = true;

                return md.getObjectUsing(projectId, object, { types, nearest }).then(() => {
                    expect(postSpy.calledWith(using2Uri, {
                        data: JSON.stringify({
                            inUse: {
                                uri: object,
                                types,
                                nearest: 1
                            }
                        })
                    })).to.be(true);
                });
            });

            it('should return rejected promise if 400 returned from backend', () => {
                fetchMock.mock(
                    using2Uri,
                    { status: 400, body: JSON.stringify({}) }
                );

                return md.getObjectUsing(projectId, object, { types }).then(() => {
                    expect().fail('Should reject the promise on 400 response');
                }).catch((err) => {
                    expect(err.response.status).to.be(400);
                });
            });
        });

        describe('getObjectUsingMany', () => {
            let postSpy;

            const projectId = 'myFakeProjectId';
            const object1 = `/gdc/md/${projectId}/obj/1`;
            const object2 = `/gdc/md/${projectId}/obj/2`;
            const objects = [object1, object2];
            const types = ['firstType', 'secondType'];
            const using2Uri = `/gdc/md/${projectId}/using2`;

            const response = [{
                entries: [{
                    link: 'foo'
                }],
                uri: object1
            }, {
                entries: [{
                    link: 'bar'
                }],
                uri: object2
            }];

            beforeEach(() => {
                postSpy = sinon.spy(xhr, 'post');
            });

            afterEach(() => {
                postSpy.restore();
            });

            it('should load objects dependencies', () => {
                fetchMock.mock(
                    using2Uri,
                    { status: 200, body: JSON.stringify({ useMany: response }) }
                );

                return md.getObjectUsingMany(projectId, objects, { types }).then((result) => {
                    expect(postSpy.calledWith(using2Uri, {
                        data: JSON.stringify({
                            inUseMany: {
                                uris: objects,
                                types,
                                nearest: 0
                            }
                        })
                    })).to.be(true);
                    expect(result).to.eql(response);
                });
            });

            it('should be properly called with nearest when requested', () => {
                fetchMock.mock(
                    using2Uri,
                    { status: 200, body: JSON.stringify({ useMany: response }) }
                );

                const nearest = true;

                return md.getObjectUsingMany(projectId, objects, { types, nearest }).then(() => {
                    expect(postSpy.calledWith(using2Uri, {
                        data: JSON.stringify({
                            inUseMany: {
                                uris: objects,
                                types,
                                nearest: 1
                            }
                        })
                    })).to.be(true);
                });
            });

            it('should return rejected promise if 400 returned from backend', () => {
                fetchMock.mock(
                    using2Uri,
                    { status: 400, body: JSON.stringify({}) }
                );

                return md.getObjectUsingMany(projectId, objects, { types }).then(() => {
                    expect().fail('Should reject the promise on 400 response');
                }).catch((err) => {
                    expect(err.response.status).to.be(400);
                });
            });
        });

        describe('getObjects', () => {
            let postSpy;

            const generateUrisAndResponse = (projectId, number) => {
                const uris = range(number).map(i => `/gdc/md/${projectId}/obj/${i}`);
                const respondEntries = uris.map(uri => ({
                    content: {},
                    meta: { uri }
                }));

                return { uris, respondEntries };
            };

            const projectId = 'myFakeProjectId';
            const getUri = `/gdc/md/${projectId}/objects/get`;

            beforeEach(() => {
                postSpy = sinon.spy(xhr, 'post');
            });

            afterEach(() => {
                postSpy.restore();
            });

            it('should load elements', () => {
                const { uris, respondEntries } = generateUrisAndResponse(projectId, 2);

                fetchMock.mock(
                    getUri,
                    { status: 200, body: JSON.stringify({ objects: { items: respondEntries } }) }
                );

                return md.getObjects(projectId, uris).then((result) => {
                    expect(postSpy.calledOnce).to.be(true);
                    expect(postSpy.calledWith(getUri, {
                        data: JSON.stringify({
                            get: {
                                items: uris
                            }
                        })
                    })).to.be(true);

                    expect(result).to.eql(respondEntries);
                });
            });

            it('should load elements chunked', () => {
                const { uris, respondEntries } = generateUrisAndResponse(projectId, 80);

                fetchMock.mock(`/gdc/md/${projectId}/objects/get`, (url, opts) => {
                    const requestBody = JSON.parse(opts.data);

                    // respond with only those items which were requested
                    const respondItems = requestBody.get.items.map(itemUri =>
                        find(respondEntries, responseItem => responseItem.meta.uri === itemUri));

                    return {
                        body: JSON.stringify({ objects: {
                            items: respondItems
                        } }),
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    };
                });

                return md.getObjects(projectId, uris).then((result) => {
                    expect(postSpy.calledTwice).to.be(true);
                    expect(postSpy.calledWith(getUri, {
                        data: JSON.stringify({
                            get: {
                                items: uris.slice(0, 50)
                            }
                        })
                    })).to.be(true);
                    expect(postSpy.calledWith(getUri, {
                        data: JSON.stringify({
                            get: {
                                items: uris.slice(50, 80)
                            }
                        })
                    })).to.be(true);

                    expect(result).to.eql(respondEntries);
                });
            });

            it('should return rejected promise if 400 returned from backend', () => {
                const { uris } = generateUrisAndResponse(projectId, 5);
                fetchMock.mock(
                    getUri,
                    { status: 400, body: JSON.stringify({}) }
                );

                return md.getObjects(projectId, uris).then(() => {
                    expect().fail('Should reject the promise on 400 response');
                }).catch((err) => {
                    expect(err.response.status).to.be(400);
                });
            });
        });

        describe('getValidElements', () => {
            let postSpy;
            const projectId = 'myFakeProjectId';
            const attributeId = 'attribute.id';
            const uri = `/gdc/md/${projectId}/obj/${attributeId}/validElements`;

            beforeEach(() => { // eslint-disable-line mocha/no-hooks-for-single-case
                postSpy = sinon.spy(xhr, 'post');
            });

            afterEach(() => { // eslint-disable-line mocha/no-hooks-for-single-case
                postSpy.restore();
            });

            it('should process params from options', () => {
                const queryString = '?limit=10&offset=5&order=asc&filter=foo&prompt=bar';
                fetchMock.mock(`${uri}${queryString}`, () => {
                    return {
                        body: JSON.stringify({
                            validElements: {
                                items: []
                            }
                        }),
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    };
                });

                const options = {
                    limit: 10,
                    offset: 5,
                    order: 'asc',
                    filter: 'foo',
                    prompt: 'bar',
                    uris: ['foo', 'bar'],
                    complement: true,
                    includeTotalCountWithoutFilters: true,
                    restrictiveDefinition: 'foo'
                };

                return md.getValidElements(projectId, attributeId, options)
                    .then((result) => {
                        expect(postSpy.calledOnce).to.be(true);
                        expect(postSpy.calledWith(
                            `${uri}${queryString}`, {
                                data: JSON.stringify({
                                    validElementsRequest: {
                                        uris: options.uris,
                                        complement: true,
                                        includeTotalCountWithoutFilters: true,
                                        restrictiveDefinition: 'foo'
                                    }
                                })
                            })).to.be(true);

                        expect(result).to.eql({
                            validElements: {
                                items: []
                            }
                        });
                    });
            });

            it('should strip ? if no params defined', () => {
                fetchMock.mock(uri, () => {
                    return {
                        body: JSON.stringify({
                            validElements: {
                                items: []
                            }
                        }),
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    };
                });

                const options = {};

                return md.getValidElements(projectId, attributeId, options)
                    .then((result) => {
                        expect(postSpy.calledOnce).to.be(true);
                        expect(postSpy.calledWith(uri, {
                            data: JSON.stringify({
                                validElementsRequest: {}
                            })
                        })).to.be(true);

                        expect(result).to.eql({
                            validElements: {
                                items: []
                            }
                        });
                    });
            });
        });
    });
});
