import {
  env,
  createExecutionContext,
  waitOnExecutionContext,
} from "cloudflare:test"
import { describe, it, expect } from "vitest"
import worker from "../../src/index"

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>

describe("Latitude of geolocations should be between -90 and 90", () => {
  it("should return 422 if any latitude is below -90", async () => {
    const request = new IncomingRequest("http://test.dev/dengue/create-case", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        userId: "user123",
        symptoms: ["fever", "headache"],
        locations: [
          {
            name: "location1",
            coordinates: {
              latitude: 1.234,
              longitude: 5.678,
            },
          },
          {
            name: "location2",
            coordinates: {
              latitude: -91,
              longitude: 5.678,
            },
          },
          {
            name: "location3",
            coordinates: {
              latitude: 1.234,
              longitude: 5.678,
            },
          }
        ],
        remarks: "Remarks",
      }),
    })
    const ctx = createExecutionContext()
    const response = await worker.fetch(request, env, ctx)
    await waitOnExecutionContext(ctx)

    expect(response.status).toBe(422)
  });

  it("should create a new dengue case if latitude is -90", async () => {
    const request = new IncomingRequest("http://test.dev/dengue/create-case", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        userId: "user123",
        symptoms: ["fever", "headache"],
        locations: [
          {
            name: "location1",
            coordinates: {
              latitude: -90,
              longitude: 5.678,
            },
          }
        ],
        remarks: "Remarks",
      }),
    })
    const ctx = createExecutionContext()
    const response = await worker.fetch(request, env, ctx)
    await waitOnExecutionContext(ctx)

    expect(response.status).toBe(200)
    const body: {
      status: boolean
      data: {
        caseId: string
      }
    } = await response.json()
    expect(body.status).toBe(true)
    expect(body.data.caseId).toHaveLength(20)
  });

  it("should create a new dengue case if latitude is 90", async () => {
    const request = new IncomingRequest("http://test.dev/dengue/create-case", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        userId: "user123",
        symptoms: ["fever", "headache"],
        locations: [
          {
            name: "location1",
            coordinates: {
              latitude: 90,
              longitude: 5.678,
            },
          }
        ],
        remarks: "Remarks",
      }),
    })
    const ctx = createExecutionContext()
    const response = await worker.fetch(request, env, ctx)
    await waitOnExecutionContext(ctx)

    expect(response.status).toBe(200)
    const body: {
      status: boolean
      data: {
        caseId: string
      }
    } = await response.json()
    expect(body.status).toBe(true)
    expect(body.data.caseId).toHaveLength(20)
  });

  it("should return 422 if any latitude is above 90", async () => {
    const request = new IncomingRequest("http://test.dev/dengue/create-case", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        userId: "user123",
        symptoms: ["fever", "headache"],
        locations: [
          {
            name: "location1",
            coordinates: {
              latitude: 1.234,
              longitude: 5.678,
            },
          },
          {
            name: "location2",
            coordinates: {
              latitude: 91,
              longitude: 5.678,
            },
          },
          {
            name: "location3",
            coordinates: {
              latitude: 1.234,
              longitude: 5.678,
            },
          }
        ],
        remarks: "Remarks",
      }),
    })
    const ctx = createExecutionContext()
    const response = await worker.fetch(request, env, ctx)
    await waitOnExecutionContext(ctx)

    expect(response.status).toBe(422)
  });
});

describe("Longitude of geolocations should be between -180 and 180", () => {
  it("should return 422 if any longitude is below -180", async () => {
    const request = new IncomingRequest("http://test.dev/dengue/create-case", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        userId: "user123",
        symptoms: ["fever", "headache"],
        locations: [
          {
            name: "location1",
            coordinates: {
              latitude: 1.234,
              longitude: 5.678,
            },
          },
          {
            name: "location2",
            coordinates: {
              latitude: 1.234,
              longitude: -181,
            },
          },
          {
            name: "location3",
            coordinates: {
              latitude: 1.234,
              longitude: 5.678,
            },
          }
        ],
        remarks: "Remarks",
      }),
    })
    const ctx = createExecutionContext()
    const response = await worker.fetch(request, env, ctx)
    await waitOnExecutionContext(ctx)

    expect(response.status).toBe(422)
  });

  it("should create a new dengue case if longitude is -180", async () => {
    const request = new IncomingRequest("http://test.dev/dengue/create-case", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        userId: "user123",
        symptoms: ["fever", "headache"],
        locations: [
          {
            name: "location1",
            coordinates: {
              latitude: 1.234,
              longitude: -180,
            },
          }
        ],
        remarks: "Remarks",
      }),
    })
    const ctx = createExecutionContext()
    const response = await worker.fetch(request, env, ctx)
    await waitOnExecutionContext(ctx)

    expect(response.status).toBe(200)
    const body: {
      status: boolean
      data: {
        caseId: string
      }
    } = await response.json()
    expect(body.status).toBe(true)
    expect(body.data.caseId).toHaveLength(20)
  });

  it("should create a new dengue case if longitude is 180", async () => {
    const request = new IncomingRequest("http://test.dev/dengue/create-case", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        userId: "user123",
        symptoms: ["fever", "headache"],
        locations: [
          {
            name: "location1",
            coordinates: {
              latitude: 1.234,
              longitude: 180,
            },
          }
        ],
        remarks: "Remarks",
      }),
    })
    const ctx = createExecutionContext()
    const response = await worker.fetch(request, env, ctx)
    await waitOnExecutionContext(ctx)

    expect(response.status).toBe(200)
    const body: {
      status: boolean
      data: {
        caseId: string
      }
    } = await response.json()
    expect(body.status).toBe(true)
    expect(body.data.caseId).toHaveLength(20)
  });

  it("should return 422 if any longitude is above 180", async () => {
    const request = new IncomingRequest("http://test.dev/dengue/create-case", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        userId: "user123",
        symptoms: ["fever", "headache"],
        locations: [
          {
            name: "location1",
            coordinates: {
              latitude: 1.234,
              longitude: 5.678,
            },
          },
          {
            name: "location2",
            coordinates: {
              latitude: 1.234,
              longitude: 181,
            },
          },
          {
            name: "location3",
            coordinates: {
              latitude: 1.234,
              longitude: 5.678,
            },
          }
        ],
        remarks: "Remarks",
      }),
    })
    const ctx = createExecutionContext()
    const response = await worker.fetch(request, env, ctx)
    await waitOnExecutionContext(ctx)

    expect(response.status).toBe(422)
  });
});