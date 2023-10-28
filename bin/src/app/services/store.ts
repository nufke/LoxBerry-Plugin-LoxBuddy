import { Observable, BehaviorSubject } from 'rxjs';
import { map, shareReplay } from "rxjs/operators";

interface SetStateCallback<T> {
	( currentState: T ): Partial<T>;
}

export abstract class Store<T> {
  private _state: BehaviorSubject<T>;

  constructor(initialState: T) {
    this._state = new BehaviorSubject<T>(initialState);
  }

  /**
   * get observable of state in store
   */
  protected get state$(): Observable<T> {
    return this._state.asObservable();
  }

  /**
   * get snapshot of state in store
   */
  protected get state(): T {
    return this._state.getValue();
  }

  /**
   * selector to grab a specified slice of data from the store
   */
   protected select$<K>(selector: (state: T) => K): Observable<K> {
    return this.state$.pipe(
      map(selector),
      shareReplay()
    );
  }

  /**
   * selector to grab data from the store for a specified key
   */
  protected selectByKey$<K extends keyof T>(key: K) : Observable<T[K]> {
    return this.state$.pipe(
      map( (state: T) => {
        return(state[key]);
      }),
      shareReplay()
    );
  }

 /**
   * methods to update state in store
   */
  protected setState(_callback: SetStateCallback<T>): void;
  protected setState(_partialState: Partial<T>): void;
  protected setState(updater: any): void {
    let currentState = this.state;
    let partialState = (updater instanceof Function) ? updater(currentState) : updater;
    let newState = Object.assign({}, currentState, partialState);
    this._state.next(newState);
  }
}
