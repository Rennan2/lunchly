/** Reservation for Lunchly */

const moment = require("moment");

const db = require("../db");


/** A reservation for a party */

class Reservation {
  constructor({id, customerId, numGuests, startAt, notes}) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

  /** getting and setting amount of guests  */

  set numGuests(val){
    if (val < 1) throw new Error("Number of guests must be at least 1");
    this._numGuests = val;
  }

  get numGuests(){
    return this._numGuests;
  }

  /** getting and setting startAT  */
  set startAt(val){
    if (val instanceof Date && !isNaN(val)) this.startAt = val;
    else throw new Error("Start date must be a valid date");
  }

  get startAt(){
    return this._startAt;
  }

  // format for startAt

  get formattedStartAt(){
    return moment(this.startAt).format('MMMM Do YYYY, h:mm a');
  }

  /** setting notes */

  set notes(val){
    this._notes = val || "";
  }

  get notes(){
    return this._notes;
  }

  /** setting and getting customer ID */

  set customerId(val) {
    if (this._customerId && this._customerId !== val)
    throw new Error("Can't change customer ID");

    this._customerId = val;
  }

  get customerId() {
    return this._customerId;
  }


  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
          `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1`,
        [customerId]
    );

    return results.rows.map(row => new Reservation(row));
  }

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO reservations (customer_id, num_guests, start_at, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.customerId, this.numGuests, this.startAt, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE reservations SET num_guests=$1, start_at=$2, notes=$3
             WHERE id=$5`,
        [ this.numGuests, this.startAt, this.notes, this.id]
      );
    }
  }
}


module.exports = Reservation;
