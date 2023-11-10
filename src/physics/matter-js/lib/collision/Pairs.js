/**
* The `Matter.Pairs` module contains methods for creating and manipulating collision pair sets.
*
* @class Pairs
*/

var Pairs = {};

module.exports = Pairs;

var Pair = require('./Pair');
var Common = require('../core/Common');

(function() {

    /**
     * Creates a new pairs structure.
     * @method create
     * @param {object} options
     * @return {pairs} A new pairs structure
     */
    Pairs.create = function(options) {
        return Common.extend({
            table: {},
            list: [],
            collisionStart: [],
            collisionActive: [],
            collisionEnd: []
        }, options);
    };

    /**
     * Updates pairs given a list of collisions.
     * @method update
     * @param {object} pairs
     * @param {collision[]} collisions
     * @param {number} timestamp
     */
    Pairs.update = function(pairs, collisions, timestamp) {
        var pairUpdate = Pair.update,
            pairCreate = Pair.create,
            pairSetActive = Pair.setActive,
            pairsTable = pairs.table,
            pairsList = pairs.list,
            pairsListLength = pairsList.length,
            pairsListIndex = pairsListLength,
            collisionStart = pairs.collisionStart,
            collisionEnd = pairs.collisionEnd,
            collisionActive = pairs.collisionActive,
            collisionsLength = collisions.length,
            collisionStartIndex = 0,
            collisionEndIndex = 0,
            collisionActiveIndex = 0,
            collision,
            pair,
            bodyA,
            bodyB,
            i;

        for (i = 0; i < collisionsLength; i++) {
            collision = collisions[i];
            pair = collision.pair;

            if (pair) {
                // pair already exists (but may or may not be active)
                if (pair.isActive) {
                    // pair exists and is active
                    collisionActive[collisionActiveIndex++] = pair;
                } else {
                    // pair exists but was inactive, so a collision has just started again
                    collisionStart[collisionStartIndex++] = pair;
                }

                // update the pair
                pairUpdate(pair, collision, timestamp);
            } else {
                // pair did not exist, create a new pair
                pair = pairCreate(collision, timestamp);
                pairsTable[pair.id] = pair;

                // add the new pair
                collisionStart[collisionStartIndex++] = pair;
                pairsList[pairsListIndex++] = pair;
            }
        }

        // find pairs that are no longer active
        pairsListIndex = 0;
        pairsListLength = pairsList.length;

        for (i = 0; i < pairsListLength; i++) {
            pair = pairsList[i];

            if (pair.timeUpdated < timestamp) {

                bodyA = pair.collision.bodyA;
                bodyB = pair.collision.bodyB;

                // if ((bodyA.isSleeping && bodyB.isSleeping) || bodyA.isStatic || bodyB.isStatic)
                // {
                //     continue;
                // }

                // keep pair if it is sleeping but not both static
                // if ((bodyA.isSleeping || bodyA.isStatic) || (bodyB.isSleeping || bodyB.isStatic) && !(bodyA.isStatic && bodyB.isStatic)) {
                //     pairSetActive(pair, true, timestamp);
                //     continue;
                // }

                // pairSetActive(pair, false, timestamp);
                // collisionEnd[collisionEndIndex++] = pair;

                // keep pair if it is sleeping but not both static
                // if ((bodyA.isSleeping || bodyA.isStatic) && (bodyB.isSleeping || bodyB.isStatic)
                // && !(bodyA.isStatic && bodyB.isStatic)) {
                // continue;
                // }

                // remove inactive pairs
                // if (!bodyA.isSleeping && !bodyB.isSleeping && !bodyA.isStatic && !bodyB.isStatic) {
                if ((!bodyA.isSleeping || !bodyA.isStatic) && (!bodyB.isSleeping || !bodyB.isStatic)) {
                    console.log('deleted pair', bodyA, bodyB);
                    pairSetActive(pair, false, timestamp);
                    collisionEnd[collisionEndIndex++] = pair;
                    delete pairsTable[pair.id];
                }
            } else {
                pairsList[pairsListIndex++] = pair;
            }
        }

        // update array lengths if changed
        if (pairsList.length !== pairsListIndex) {
            pairsList.length = pairsListIndex;
        }

        if (collisionStart.length !== collisionStartIndex) {
            collisionStart.length = collisionStartIndex;
        }

        if (collisionEnd.length !== collisionEndIndex) {
            collisionEnd.length = collisionEndIndex;
        }

        if (collisionActive.length !== collisionActiveIndex) {
            collisionActive.length = collisionActiveIndex;
        }
    };

    /**
     * Clears the given pairs structure.
     * @method clear
     * @param {pairs} pairs
     * @return {pairs} pairs
     */
    Pairs.clear = function(pairs) {
        pairs.table = {};
        pairs.list.length = 0;
        pairs.collisionStart.length = 0;
        pairs.collisionActive.length = 0;
        pairs.collisionEnd.length = 0;
        return pairs;
    };

})();
