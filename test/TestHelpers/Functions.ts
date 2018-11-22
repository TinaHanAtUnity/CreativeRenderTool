import * as sinon from 'sinon';

export function asSpy(o: unknown): sinon.SinonSpy {
    return <sinon.SinonSpy>o;
}

export function asStub(o: unknown): sinon.SinonStub {
    return <sinon.SinonStub>o;
}
