// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
import fetchMock from '../utils/fetch-mock';
import * as domains from '../../src/admin/domains';

describe('project', () => {
    describe('with fake server', () => {
        afterEach(() => {
            fetchMock.restore();
        });

        describe('getDomainProjects', () => {
            it('should reject with 400 when resource fails', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/domains/domainId/projects',
                    400
                );

                return domains.getDomainProjects('contractId', 'domainId', null, null).then(null, err => expect(err).to.be.an(Error));
            });

            it('should return domains projects', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/domains/domainId/projects',
                    {
                        status: 200,
                        body: JSON.stringify({
                            domainProjects: {
                                items: [{ project: { title: 'project0' } }, { project: { title: 'project1' } }],
                                paging: {}
                            }
                        })
                    }
                );

                return domains.getDomainProjects('contractId', 'domainId', null, null).then((result) => {
                    console.log(result);
                    console.log(result.items);
                    expect(result.items.length).to.be(2);
                    expect(result.items[0].title).to.be('project0');
                });
            });
        });

        describe('should return empty projects', () => {
            it('should reject with 400 when resource fails', () => {
            });
        });
    });
});
