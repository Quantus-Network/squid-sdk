import {Bytes, CallRecord, Runtime} from '@subsquid/substrate-runtime'
import {decodeHex, toHex} from '@subsquid/util-internal-hex'
import blake2b from 'blake2b'
import {Extrinsic} from '../interfaces/data'

/**
 * Hash function interface to derive extrinsic hash.
 * Accepts raw extrinsic bytes and returns hash encoded as hex-prefixed string.
 */
export type HashFn = (bytes: Uint8Array) => Bytes


export interface DecodedExtrinsic {
    extrinsic: Extrinsic
    call: CallRecord
}


export function decodeExtrinsics(
    runtime: Runtime,
    extrinsics: Bytes[],
    withHash: boolean,
    hashFn: HashFn = (bytes) => toHex(blake2b(32).update(bytes).digest())
): DecodedExtrinsic[] {
    return extrinsics.map((hex, index) => {
        let bytes = decodeHex(hex)
        let src = runtime.decodeExtrinsic(bytes)

        let extrinsic: Extrinsic = {
            index,
            version: src.version
        }

        if (src.signature) {
            extrinsic.signature = src.signature
        }

        if (withHash) {
            extrinsic.hash = hashFn(bytes)
        }

        let call = runtime.toCallRecord(src.call)

        return {extrinsic, call}
    })
}
