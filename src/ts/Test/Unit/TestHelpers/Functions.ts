import * as sinon from 'sinon';

export function asSpy(o: any): sinon.SinonSpy {
    return <sinon.SinonSpy>o;
}

export function asStub(o: any): sinon.SinonStub {
    return <sinon.SinonStub>o;
}
