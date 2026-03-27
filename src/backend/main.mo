import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Order "mo:core/Order";
import Time "mo:core/Time";



actor {
  // TYPES
  type Patient = {
    id : Text;
    name : Text;
    age : Nat;
    gender : Text;
    phone : Text;
    address : Text;
    createdAt : Int;
    updatedAt : Int;
  };

  module Patient {
    public func compare(p1 : Patient, p2 : Patient) : Order.Order {
      switch (Text.compare(p1.name, p2.name)) {
        case (#equal) { Text.compare(p1.id, p2.id) };
        case (order) { order };
      };
    };
  };

  type TestParameter = {
    id : Text;
    name : Text;
    unit : Text;
    referenceRange : Text;
    referenceMin : ?Float;
    referenceMax : ?Float;
  };

  module TestParameter {
    public func compare(tp1 : TestParameter, tp2 : TestParameter) : Order.Order {
      Text.compare(tp1.id, tp2.id);
    };
  };

  type LabTest = {
    id : Text;
    name : Text;
    category : Text;
    price : Float;
    parameters : [TestParameter];
    createdAt : Int;
    updatedAt : Int;
  };

  module LabTest {
    public func compare(t1 : LabTest, t2 : LabTest) : Order.Order {
      switch (Text.compare(t1.name, t2.name)) {
        case (#equal) { Text.compare(t1.id, t2.id) };
        case (order) { order };
      };
    };
  };

  type Booking = {
    id : Text;
    bookingId : Text;
    patientId : Text;
    testIds : [Text];
    totalAmount : Float;
    status : Text;
    sampleId : Text;
    collectedAt : ?Int;
    createdAt : Int;
    updatedAt : Int;
  };

  module Booking {
    public func compare(b1 : Booking, b2 : Booking) : Order.Order {
      Int.compare(b2.createdAt, b1.createdAt);
    };
  };

  type TestResult = {
    id : Text;
    bookingId : Text;
    testId : Text;
    parameterId : Text;
    value : Text;
    unit : Text;
    referenceRange : Text;
    isAbnormal : Bool;
    createdAt : Int;
    updatedAt : Int;
  };

  type Report = {
    id : Text;
    bookingId : Text;
    status : Text;
    approvedAt : ?Int;
    approvedBy : Text;
    createdAt : Int;
    updatedAt : Int;
  };

  type Payment = {
    id : Text;
    bookingId : Text;
    amount : Float;
    status : Text;
    paidAt : ?Int;
    method : Text;
    partialAmount : Float;
    createdAt : Int;
    updatedAt : Int;
  };

  type OutsourceLab = {
    id : Text;
    name : Text;
    contactPerson : Text;
    phone : Text;
    email : Text;
    address : Text;
    assignedTests : [Text];
    createdAt : Int;
    updatedAt : Int;
  };

  module OutsourceLab {
    public func compare(lab1 : OutsourceLab, lab2 : OutsourceLab) : Order.Order {
      Int.compare(lab2.createdAt, lab1.createdAt);
    };
  };

  type LabSettings = {
    labName : Text;
    labAddress : Text;
    labPhone : Text;
    labEmail : Text;
    reportHeader : Text;
    reportFooter : Text;
    currency : Text;
  };

  type DashboardStats = {
    totalPatients : Nat;
    totalTests : Nat;
    totalBookings : Nat;
    pendingBookings : Nat;
    totalRevenue : Float;
    monthlyRevenue : Float;
    currentTime : Int;
  };

  // </types>

  // DATA
  let patients = Map.empty<Text, Patient>();
  let testParameters = Map.empty<Text, TestParameter>();
  let labTests = Map.empty<Text, LabTest>();
  let bookings = Map.empty<Text, Booking>();
  let testResults = Map.empty<Text, TestResult>();
  let reports = Map.empty<Text, Report>();
  let payments = Map.empty<Text, Payment>();
  let outsourceLabs = Map.empty<Text, OutsourceLab>();
  var labSettings : ?LabSettings = null;
  //</data>

  // PATIENTS
  public shared ({ caller }) func createPatient(patient : Patient) : async () {
    if (patients.containsKey(patient.id)) { Runtime.trap("Patient already exists") };
    patients.add(patient.id, patient);
  };

  public shared ({ caller }) func updatePatient(patient : Patient) : async () {
    if (not patients.containsKey(patient.id)) { Runtime.trap("Patient does not exist") };
    patients.add(patient.id, patient);
  };

  public shared ({ caller }) func deletePatient(id : Text) : async () {
    if (not patients.containsKey(id)) { Runtime.trap("Patient does not exist") };
    patients.remove(id);
  };

  public query ({ caller }) func getPatient(id : Text) : async Patient {
    switch (patients.get(id)) {
      case (null) { Runtime.trap("Patient does not exist") };
      case (?patient) { patient };
    };
  };

  public query ({ caller }) func getAllPatients() : async [Patient] {
    patients.values().toArray().sort();
  };

  public query ({ caller }) func searchPatients(searchQuery : Text) : async [Patient] {
    patients.values().toArray().filter(
      func(patient) {
        patient.name.contains(#text searchQuery) or patient.phone.contains(#text searchQuery) or patient.address.contains(#text searchQuery);
      }
    );
  };

  // TEST PARAMETERS
  public shared ({ caller }) func createTestParameter(param : TestParameter) : async () {
    if (testParameters.containsKey(param.id)) { Runtime.trap("Parameter already exists") };
    testParameters.add(param.id, param);
  };

  public shared ({ caller }) func updateTestParameter(param : TestParameter) : async () {
    if (not testParameters.containsKey(param.id)) { Runtime.trap("Parameter does not exist") };
    testParameters.add(param.id, param);
  };

  public shared ({ caller }) func deleteTestParameter(id : Text) : async () {
    if (not testParameters.containsKey(id)) { Runtime.trap("Parameter does not exist") };
    testParameters.remove(id);
  };

  public query ({ caller }) func getTestParameter(id : Text) : async TestParameter {
    switch (testParameters.get(id)) {
      case (null) { Runtime.trap("Parameter does not exist") };
      case (?param) { param };
    };
  };

  public query ({ caller }) func getAllTestParameters() : async [TestParameter] {
    testParameters.values().toArray().sort();
  };

  // LAB TESTS
  public shared ({ caller }) func createLabTest(test : LabTest) : async () {
    if (labTests.containsKey(test.id)) { Runtime.trap("Test already exists") };
    labTests.add(test.id, test);
  };

  public shared ({ caller }) func updateLabTest(test : LabTest) : async () {
    if (not labTests.containsKey(test.id)) { Runtime.trap("Test does not exist") };
    labTests.add(test.id, test);
  };

  public shared ({ caller }) func deleteLabTest(id : Text) : async () {
    if (not labTests.containsKey(id)) { Runtime.trap("Test does not exist") };
    labTests.remove(id);
  };

  public query ({ caller }) func getLabTest(id : Text) : async LabTest {
    switch (labTests.get(id)) {
      case (null) { Runtime.trap("Test does not exist") };
      case (?test) { test };
    };
  };

  public query ({ caller }) func getAllLabTests() : async [LabTest] {
    labTests.values().toArray().sort();
  };

  // BOOKINGS
  public shared ({ caller }) func createBooking(booking : Booking) : async () {
    if (bookings.containsKey(booking.id)) { Runtime.trap("Booking already exists") };
    bookings.add(booking.id, booking);
  };

  public shared ({ caller }) func updateBooking(booking : Booking) : async () {
    if (not bookings.containsKey(booking.id)) { Runtime.trap("Booking does not exist") };
    bookings.add(booking.id, booking);
  };

  public shared ({ caller }) func deleteBooking(id : Text) : async () {
    if (not bookings.containsKey(id)) { Runtime.trap("Booking does not exist") };
    bookings.remove(id);
  };

  public query ({ caller }) func getBooking(id : Text) : async Booking {
    switch (bookings.get(id)) {
      case (null) { Runtime.trap("Booking does not exist") };
      case (?booking) { booking };
    };
  };

  public query ({ caller }) func getAllBookings() : async [Booking] {
    bookings.values().toArray().sort();
  };

  public query ({ caller }) func getBookingsByStatus(status : Text) : async [Booking] {
    bookings.values().toArray().filter(
      func(booking) { booking.status == status }
    ).sort();
  };

  public query ({ caller }) func getBookingsByPatient(patientId : Text) : async [Booking] {
    bookings.values().toArray().filter(
      func(booking) { booking.patientId == patientId }
    ).sort();
  };

  public shared ({ caller }) func markSamplesCollected(bookingIds : [Text]) : async () {
    for (bookingId in bookingIds.values()) {
      switch (bookings.get(bookingId)) {
        case (null) { Runtime.trap("Booking does not exist") };
        case (?booking) {
          let updatedBooking : Booking = {
            booking with
            status = "collected";
            collectedAt = ?Time.now();
          };
          bookings.add(bookingId, updatedBooking);
        };
      };
    };
  };

  // TEST RESULTS
  public shared ({ caller }) func createTestResult(result : TestResult) : async () {
    if (testResults.containsKey(result.id)) { Runtime.trap("Result already exists") };
    testResults.add(result.id, result);
  };

  public shared ({ caller }) func updateTestResult(result : TestResult) : async () {
    if (not testResults.containsKey(result.id)) { Runtime.trap("Result does not exist") };
    testResults.add(result.id, result);
  };

  public shared ({ caller }) func deleteTestResult(id : Text) : async () {
    if (not testResults.containsKey(id)) { Runtime.trap("Result does not exist") };
    testResults.remove(id);
  };

  public query ({ caller }) func getTestResult(id : Text) : async TestResult {
    switch (testResults.get(id)) {
      case (null) { Runtime.trap("Result does not exist") };
      case (?result) { result };
    };
  };

  public query ({ caller }) func getResultsByBooking(bookingId : Text) : async [TestResult] {
    testResults.values().toArray().filter(
      func(result) { result.bookingId == bookingId }
    );
  };

  public shared ({ caller }) func approveTestResult(resultId : Text, approvedBy : Text) : async () {
    switch (testResults.get(resultId)) {
      case (null) { Runtime.trap("Result does not exist") };
      case (?result) {
        let updatedResult : TestResult = {
          result with
          updatedAt = Time.now();
        };
        testResults.add(resultId, updatedResult);
      };
    };
  };

  // REPORTS
  public shared ({ caller }) func createReport(report : Report) : async () {
    if (reports.containsKey(report.id)) { Runtime.trap("Report already exists") };
    reports.add(report.id, report);
  };

  public shared ({ caller }) func updateReport(report : Report) : async () {
    if (not reports.containsKey(report.id)) { Runtime.trap("Report does not exist") };
    reports.add(report.id, report);
  };

  public shared ({ caller }) func deleteReport(id : Text) : async () {
    if (not reports.containsKey(id)) { Runtime.trap("Report does not exist") };
    reports.remove(id);
  };

  public query ({ caller }) func getReport(id : Text) : async Report {
    switch (reports.get(id)) {
      case (null) { Runtime.trap("Report does not exist") };
      case (?report) { report };
    };
  };

  public query ({ caller }) func getReportByBooking(bookingId : Text) : async ?Report {
    reports.values().toArray().find(
      func(report) { report.bookingId == bookingId }
    );
  };

  public shared ({ caller }) func approveReport(reportId : Text, approvedBy : Text) : async () {
    switch (reports.get(reportId)) {
      case (null) { Runtime.trap("Report does not exist") };
      case (?report) {
        let updatedReport : Report = {
          report with
          status = "approved";
          approvedBy;
          approvedAt = ?Time.now();
        };
        reports.add(reportId, updatedReport);
      };
    };
  };

  public shared ({ caller }) func markReportDelivered(reportId : Text) : async () {
    switch (reports.get(reportId)) {
      case (null) { Runtime.trap("Report does not exist") };
      case (?report) {
        let updatedReport : Report = {
          report with
          status = "delivered";
        };
        reports.add(reportId, updatedReport);
      };
    };
  };

  // PAYMENTS
  public shared ({ caller }) func createPayment(payment : Payment) : async () {
    if (payments.containsKey(payment.id)) { Runtime.trap("Payment already exists") };
    payments.add(payment.id, payment);
  };

  public shared ({ caller }) func updatePayment(payment : Payment) : async () {
    if (not payments.containsKey(payment.id)) { Runtime.trap("Payment does not exist") };
    payments.add(payment.id, payment);
  };

  public shared ({ caller }) func deletePayment(id : Text) : async () {
    if (not payments.containsKey(id)) { Runtime.trap("Payment does not exist") };
    payments.remove(id);
  };

  public query ({ caller }) func getPayment(id : Text) : async Payment {
    switch (payments.get(id)) {
      case (null) { Runtime.trap("Payment does not exist") };
      case (?payment) { payment };
    };
  };

  public query ({ caller }) func getPaymentByBooking(bookingId : Text) : async ?Payment {
    payments.values().toArray().find(
      func(payment) { payment.bookingId == bookingId }
    );
  };

  public query ({ caller }) func getAllPayments() : async [Payment] {
    payments.values().toArray();
  };

  public shared ({ caller }) func markPaymentPaid(paymentId : Text, method : Text) : async () {
    switch (payments.get(paymentId)) {
      case (null) { Runtime.trap("Payment does not exist") };
      case (?payment) {
        let updatedPayment : Payment = {
          payment with
          status = "paid";
          method;
          paidAt = ?Time.now();
        };
        payments.add(paymentId, updatedPayment);
      };
    };
  };

  public shared ({ caller }) func markPartialPayment(paymentId : Text, amount : Float) : async () {
    switch (payments.get(paymentId)) {
      case (null) { Runtime.trap("Payment does not exist") };
      case (?payment) {
        let updatedPayment : Payment = {
          payment with
          status = "partial";
          partialAmount = amount;
        };
        payments.add(paymentId, updatedPayment);
      };
    };
  };

  // OUTSOURCE LABS
  public shared ({ caller }) func createOutsourceLab(lab : OutsourceLab) : async () {
    if (outsourceLabs.containsKey(lab.id)) { Runtime.trap("Lab already exists") };
    outsourceLabs.add(lab.id, lab);
  };

  public shared ({ caller }) func updateOutsourceLab(lab : OutsourceLab) : async () {
    if (not outsourceLabs.containsKey(lab.id)) { Runtime.trap("Lab does not exist") };
    outsourceLabs.add(lab.id, lab);
  };

  public shared ({ caller }) func deleteOutsourceLab(id : Text) : async () {
    if (not outsourceLabs.containsKey(id)) { Runtime.trap("Lab does not exist") };
    outsourceLabs.remove(id);
  };

  public query ({ caller }) func getOutsourceLab(id : Text) : async OutsourceLab {
    switch (outsourceLabs.get(id)) {
      case (null) { Runtime.trap("Lab does not exist") };
      case (?lab) { lab };
    };
  };

  public query ({ caller }) func getAllOutsourceLabs() : async [OutsourceLab] {
    outsourceLabs.values().toArray().sort();
  };

  // SETTINGS
  public query ({ caller }) func getSettings() : async ?LabSettings {
    labSettings;
  };

  public shared ({ caller }) func saveSettings(settings : LabSettings) : async () {
    labSettings := ?settings;
  };

  // DASHBOARD
  public query ({ caller }) func getDashboardStats() : async DashboardStats {
    let totalPatients = patients.size();
    let totalTests = labTests.size();
    let totalBookings = bookings.size();
    let pendingBookings = bookings.values().toArray().filter(
      func(booking) { booking.status == "pending" }
    ).size();

    let totalRevenue = payments.values().toArray().foldLeft(
      0.0,
      func(acc, payment) { acc + payment.amount },
    );

    let currentTime = Time.now();
    let thirtyDaysInNanos : Int = 30 * 24 * 60 * 60 * 1000000000;
    let cutoffTime = currentTime - thirtyDaysInNanos;

    let monthlyRevenue = payments.values().toArray().foldLeft(
      0.0,
      func(acc, payment) {
        if (payment.createdAt >= cutoffTime) { acc + payment.amount } else { acc };
      },
    );

    {
      totalPatients;
      totalTests;
      totalBookings;
      pendingBookings;
      totalRevenue;
      monthlyRevenue;
      currentTime;
    };
  };
};
