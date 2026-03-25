'use server';
let mockDatabase = { cartRecords: [] as number[], currentTotal: 0 };
export async function syncCartWithDatabase(items: number) {
    try {
        console.log(`[SERVER] Saving items: ${items}`);
        await new Promise((res) => setTimeout(res, 1000));
        mockDatabase.currentTotal = items;
        return { success: true };
    } catch (e) { return { success: false }; }
}