/**
	 * @description find difference between two date in mins
	 * @param date1
	 * @param date2
	 * @author Zaigham Javed
	 */
export const dateDiffInMins = async (date1: Date, date2: Date): Promise<number> => {

	let diff = (date1.getTime() - date2.getTime()) / 1000
	diff /= 60
	return Math.abs(Math.round(diff))

}