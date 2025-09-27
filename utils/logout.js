import axios from "@/lib/axios";

export function logout(router) {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  }

  // clear default header
  delete axios.defaults.headers.common["Authorization"];

  // redirect ke login
  router.push("/login");
}
