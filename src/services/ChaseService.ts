import {Activity, Chased} from "../types";

const ASKELADDS = 1234

export class ChaseService {

    static getAllies(activity: Activity[]) {
        return activity.filter(x => x.faction_id === ASKELADDS)
    }

    static getEnemies(activity:Activity[]) {
        return activity.filter(x => x.faction_id !== ASKELADDS)
    }

    static getConflicts(allies: Activity[], enemies: Activity[]){

        const enemiesToCheck = enemies
            .filter((enemy) => !enemy.alerted)

        const travelingEnemies = enemiesToCheck.filter(enemy => enemy.location.destination && enemy.location.destination !== "torn")

        const riskyAllies = allies
            .filter(x => (x.location.current != "torn" && x.location.destination != "torn") || x.location.destination !== "torn")

        return travelingEnemies.map(enemy => {
            const threatenedAllies = riskyAllies.filter(ally =>
                enemy.location.destination === ally.location.current ||
                enemy.location.destination === ally.location.destination
            )

            return threatenedAllies.length > 0 ? {
                enemy,
                threatenedAllies
            } : null
        }).filter(Boolean) as Chased[]
    }
}