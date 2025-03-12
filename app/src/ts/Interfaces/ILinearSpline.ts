export interface ILinearSpline<T> {
	addPoint(t: number, d: T): void;
	getValueAt(t: number): T;
}
