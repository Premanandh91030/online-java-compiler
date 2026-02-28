import Text "mo:core/Text";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  module JavaCodeSnippet {
    public func compare(left : JavaCodeSnippet, right : JavaCodeSnippet) : Order.Order {
      Int.compare(left.timestamp, right.timestamp);
    };
  };

  type JavaCodeSnippet = {
    code : Text;
    timestamp : Time.Time;
    output : ?Text;
  };

  public type UserProfile = {
    name : Text;
  };

  let javaCodeSnippets = Map.empty<Principal, [JavaCodeSnippet]>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    checkIsUser(caller);
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    checkIsCurrentUserOrAdmin(caller, user);
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    checkIsUser(caller);
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func submitJavaCode(code : Text) : async Text {
    checkIsUser(caller);
    let newSnippet : JavaCodeSnippet = {
      code;
      timestamp = Time.now();
      output = null;
    };

    let existingSnippets = switch (javaCodeSnippets.get(caller)) {
      case (null) { [] };
      case (?snippets) { snippets };
    };
    javaCodeSnippets.add(caller, existingSnippets.concat([newSnippet]));
    "Code submitted successfully. (Java execution is simulated)";
  };

  public query ({ caller }) func getUserJavaCode(user : Principal) : async [JavaCodeSnippet] {
    checkIsAdmin(caller);
    switch (javaCodeSnippets.get(user)) {
      case (null) { [] };
      case (?snippets) { snippets };
    };
  };

  public query ({ caller }) func getUserJavaCodeSnippets() : async [JavaCodeSnippet] {
    checkIsUser(caller);
    switch (javaCodeSnippets.get(caller)) {
      case (null) { [] };
      case (?snippets) { snippets };
    };
  };

  public shared ({ caller }) func deleteUserJavaCode(timestamp : Time.Time) : async Bool {
    checkIsUser(caller);

    if (not javaCodeSnippets.containsKey(caller)) { return false };

    let filteredSnippets = switch (javaCodeSnippets.get(caller)) {
      case (null) { [] };
      case (?snippets) {
        snippets.filter(
          func(snippet) { snippet.timestamp != timestamp }
        );
      };
    };
    javaCodeSnippets.add(caller, filteredSnippets);
    true;
  };

  public query ({ caller }) func searchJavaCodeSnippets(searchTerm : Text) : async [JavaCodeSnippet] {
    checkIsUser(caller);

    switch (javaCodeSnippets.get(caller)) {
      case (null) { [] };
      case (?snippets) {
        snippets.filter(
          func(snippet) { snippet.code.contains(#text searchTerm) }
        );
      };
    };
  };

  public shared ({ caller }) func clearUserJavaCode() : async () {
    checkIsUser(caller);
    javaCodeSnippets.remove(caller);
  };

  public query ({ caller }) func getCodeSnippet(timestamp : Time.Time) : async ?JavaCodeSnippet {
    checkIsUser(caller);

    switch (javaCodeSnippets.get(caller)) {
      case (null) { null };
      case (?snippets) {
        snippets.find(
          func(snippet) { snippet.timestamp == timestamp }
        );
      };
    };
  };

  public query ({ caller }) func getJavaCodeSnippetsMeta() : async [JavaCodeSnippet] {
    checkIsUser(caller);

    switch (javaCodeSnippets.get(caller)) {
      case (null) { [] };
      case (?snippets) { snippets };
    };
  };

  func checkIsAdmin(caller : Principal) {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  func checkIsUser(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
  };

  func checkIsCurrentUserOrAdmin(caller : Principal, user : Principal) {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
  };
};
