async function run() {
  const signupUrl = "http://localhost:8080/signup";
  const loginUrl = "http://localhost:8080/login";
  
  const testUser = {
    username: "auth_tester",
    email: "auth_tester@trackchange.io",
    password: "securepassword123"
  };

  console.log("=== Testing Authentication Endpoints (Native Fetch) ===");
  
  // 1. Try Signing Up
  try {
    const signupRes = await fetch(signupUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser)
    });
    const signupData = await signupRes.json();
    
    if (signupRes.ok) {
      console.log("Signup API Success! Status:", signupRes.status);
      console.log("Response Token:", signupData.token ? "PRESENT" : "MISSING");
    } else if (signupData.message === "User already exists!") {
      console.log("Signup: User already exists (OK, continuing to login test).");
    } else {
      console.error("Signup Failed:", signupData);
      return;
    }
  } catch (err) {
    console.error("Signup Error:", err.message);
    return;
  }

  // 2. Try Logging In
  try {
    const loginRes = await fetch(loginUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    const loginData = await loginRes.json();
    
    if (loginRes.ok) {
      console.log("Login API Success! Status:", loginRes.status);
      console.log("Response Token:", loginData.token ? "PRESENT" : "MISSING");
      console.log("=== All Authentication API Tests Passed ===");
    } else {
      console.error("Login Failed:", loginData);
    }
  } catch (err) {
    console.error("Login Error:", err.message);
  }
}

run();
