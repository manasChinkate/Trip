const API_AUTH_URL = "http://localhost:3000/api/auth";
const API_PLAN_URL = "http://localhost:3000/api/plans";

export interface SendOtpRequest {
  identifier: string;
  type: "EMAIL" | "PHONE";
}

export interface VerifyOtpRequest {
  identifier: string;
  code: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  dob?: string;
  age?: number;
  profilePic?: string;
}

export interface User {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  dob?: string | null;
  age?: number | null;
  profilePic?: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
}

export interface PlanMember {
  id: number;
  planId: number;
  userId: number;
  role?: string | null;
  createdAt: string;
  user?: Partial<User>;
}

export interface Plan {
  id: number;
  planCode?: string | null;
  name?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  createdBy: number;
  updatedBy?: number | null;
  createdAt: string;
  updatedAt: string;
  planMembers?: PlanMember[];
}

export interface CreatePlanRequest {
  name: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdatePlanRequest {
  name?: string;
  startDate?: string;
  endDate?: string;
}

export interface JoinPlanRequest {
  planCode: string;
}

export interface VerifyOtpResponse {
  message: string;
  isNewUser: boolean;
  token: string;
  data: User;
}

export interface SendOtpResponse {
  message: string;
  data: {
    identifier: string;
    type: "EMAIL" | "PHONE";
    expiresAt: string;
    code?: string;
  };
}

export const api = {
  // Auth APIs
  async sendOtp(payload: SendOtpRequest): Promise<SendOtpResponse> {
    const res = await fetch(`${API_AUTH_URL}/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to send OTP");
    }
    return data;
  },

  async verifyOtp(payload: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    const res = await fetch(`${API_AUTH_URL}/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to verify OTP");
    }
    return data;
  },

  async getMe(token: string): Promise<{ data: User }> {
    const res = await fetch(`${API_AUTH_URL}/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch user profile");
    }
    return data;
  },

  async updateProfile(token: string, payload: UpdateProfileRequest): Promise<{ message: string; data: User }> {
    const res = await fetch(`${API_AUTH_URL}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to update profile");
    }
    return data;
  },

  // Plan APIs
  async createPlan(token: string, payload: CreatePlanRequest): Promise<{ message: string; data: Plan }> {
    const res = await fetch(`${API_PLAN_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to create trip plan");
    }
    return data;
  },

  async getAllPlans(): Promise<{ data: Plan[] }> {
    const res = await fetch(`${API_PLAN_URL}/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch all trip plans");
    }
    return data;
  },

  async getUserPlans(token: string): Promise<{ data: Plan[] }> {
    const res = await fetch(`${API_PLAN_URL}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch trip plans");
    }
    return data;
  },

  async getPlanById(token: string, id: number): Promise<{ data: Plan }> {
    const res = await fetch(`${API_PLAN_URL}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch trip plan details");
    }
    return data;
  },

  async joinPlanByCode(token: string, payload: JoinPlanRequest): Promise<{ message: string; data: any }> {
    const res = await fetch(`${API_PLAN_URL}/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to join trip plan");
    }
    return data;
  },

  async updatePlan(token: string, id: number, payload: UpdatePlanRequest): Promise<{ message: string; data: Plan }> {
    const res = await fetch(`${API_PLAN_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to update trip plan");
    }
    return data;
  },

  async deletePlan(token: string, id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_PLAN_URL}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to delete trip plan");
    }
    return data;
  },

  async removeMember(token: string, planId: number, userId: number): Promise<{ message: string }> {
    const res = await fetch(`${API_PLAN_URL}/${planId}/members/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to remove member");
    }
    return data;
  },
};
