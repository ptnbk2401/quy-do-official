import {
  createGAClient,
  getGAPropertyId,
  validateDateRange,
  handleGAError,
  OverviewMetrics,
  TrafficData,
  TrafficSource,
  PopularPage,
  DeviceData,
  CountryData,
  GAError,
  GAErrorCodes,
} from "./google-analytics";

// Fetch overview metrics (visits, users, sessions, bounce rate)
export async function fetchOverviewMetrics(
  startDate: string,
  endDate: string
): Promise<OverviewMetrics> {
  try {
    validateDateRange(startDate, endDate);

    const client = createGAClient();
    const propertyId = getGAPropertyId();

    const [response] = await client.runReport({
      property: propertyId,
      dateRanges: [
        {
          startDate,
          endDate,
        },
      ],
      metrics: [
        { name: "activeUsers" }, // Active users (more reliable than screenPageViews)
        { name: "newUsers" }, // New users
        { name: "sessions" }, // Sessions
        // Removed bounceRate as it might not be available in all GA4 properties
      ],
    });

    const row = response.rows?.[0];
    if (!row || !row.metricValues) {
      throw new GAError(
        GAErrorCodes.GA_API_ERROR,
        "No data returned from Google Analytics"
      );
    }

    const metrics = row.metricValues;

    return {
      totalVisits: parseInt(metrics[0]?.value || "0"), // activeUsers
      newUsers: parseInt(metrics[1]?.value || "0"),
      sessions: parseInt(metrics[2]?.value || "0"),
      bounceRate: 0, // Set to 0 since we removed bounceRate metric
    };
  } catch (error) {
    throw handleGAError(error);
  }
}

// Fetch traffic data over time
export async function fetchTrafficData(
  startDate: string,
  endDate: string
): Promise<TrafficData[]> {
  try {
    validateDateRange(startDate, endDate);

    const client = createGAClient();
    const propertyId = getGAPropertyId();

    const [response] = await client.runReport({
      property: propertyId,
      dateRanges: [
        {
          startDate,
          endDate,
        },
      ],
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "sessions" }, // Sessions (more reliable than screenPageViews)
        { name: "activeUsers" }, // Users
      ],
      orderBys: [
        {
          dimension: {
            dimensionName: "date",
          },
        },
      ],
    });

    if (!response.rows) {
      return [];
    }

    return response.rows.map((row) => {
      const date = row.dimensionValues?.[0]?.value || "";
      const visits = parseInt(row.metricValues?.[0]?.value || "0");
      const users = parseInt(row.metricValues?.[1]?.value || "0");

      // Format date from YYYYMMDD to YYYY-MM-DD
      const formattedDate = date.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");

      return {
        date: formattedDate,
        visits, // This is actually sessions now
        users,
      };
    });
  } catch (error) {
    throw handleGAError(error);
  }
}

// Fetch traffic sources breakdown
export async function fetchTrafficSources(
  startDate: string,
  endDate: string
): Promise<TrafficSource[]> {
  try {
    validateDateRange(startDate, endDate);

    const client = createGAClient();
    const propertyId = getGAPropertyId();

    const [response] = await client.runReport({
      property: propertyId,
      dateRanges: [
        {
          startDate,
          endDate,
        },
      ],
      dimensions: [
        { name: "sessionDefaultChannelGrouping" }, // Traffic source channel
      ],
      metrics: [{ name: "sessions" }],
      orderBys: [
        {
          metric: {
            metricName: "sessions",
          },
          desc: true,
        },
      ],
    });

    if (!response.rows) {
      return [];
    }

    const totalSessions = response.rows.reduce((sum, row) => {
      return sum + parseInt(row.metricValues?.[0]?.value || "0");
    }, 0);

    return response.rows.map((row) => {
      const source = row.dimensionValues?.[0]?.value || "Unknown";
      const visits = parseInt(row.metricValues?.[0]?.value || "0");
      const percentage = totalSessions > 0 ? (visits / totalSessions) * 100 : 0;

      // Map GA4 channel groupings to more user-friendly names
      const sourceMapping: { [key: string]: string } = {
        "Organic Search": "Search",
        "Organic Social": "Social",
        Direct: "Direct",
        Referral: "Referral",
        "Paid Search": "Paid Search",
        "Paid Social": "Paid Social",
        Email: "Email",
        Display: "Display",
        "(not set)": "Other",
        Unassigned: "Other",
      };

      return {
        source: sourceMapping[source] || source,
        visits,
        percentage: Math.round(percentage * 100) / 100,
      };
    });
  } catch (error) {
    throw handleGAError(error);
  }
}

// Fetch top pages
export async function fetchTopPages(
  startDate: string,
  endDate: string,
  limit: number = 10
): Promise<PopularPage[]> {
  try {
    validateDateRange(startDate, endDate);

    const client = createGAClient();
    const propertyId = getGAPropertyId();
    console.log("[GA PROPERTY CHECK]", propertyId);

    const [response] = await client.runReport({
      property: propertyId,
      dateRanges: [
        {
          startDate,
          endDate,
        },
      ],
      dimensions: [
        { name: "pagePath" }, // URL path
        { name: "pageTitle" }, // Page title
      ],
      metrics: [
        { name: "sessions" }, // Sessions (more reliable)
        { name: "activeUsers" }, // Active users
      ],
      orderBys: [
        {
          metric: {
            metricName: "sessions",
          },
          desc: true,
        },
      ],
      limit,
    });

    if (!response.rows) {
      return [];
    }

    const pages = response.rows.map((row) => {
      const url = row.dimensionValues?.[0]?.value || "";
      const title = row.dimensionValues?.[1]?.value || "Untitled";
      const views = parseInt(row.metricValues?.[0]?.value || "0"); // sessions
      const uniqueViews = parseInt(row.metricValues?.[1]?.value || "0"); // activeUsers

      return {
        url,
        title: title.length > 60 ? title.substring(0, 60) + "..." : title,
        views,
        uniqueViews,
      };
    });

    // Deduplicate by URL, keeping the entry with higher views
    const deduplicatedPages = pages.reduce((acc, page) => {
      const existing = acc.find((p) => p.url === page.url);
      if (!existing) {
        acc.push(page);
      } else if (page.views > existing.views) {
        // Replace with higher view count
        const index = acc.indexOf(existing);
        acc[index] = page;
      }
      return acc;
    }, [] as PopularPage[]);

    return deduplicatedPages;
  } catch (error) {
    throw handleGAError(error);
  }
}

// Fetch device breakdown
export async function fetchDeviceData(
  startDate: string,
  endDate: string
): Promise<DeviceData[]> {
  try {
    validateDateRange(startDate, endDate);

    const client = createGAClient();
    const propertyId = getGAPropertyId();

    const [response] = await client.runReport({
      property: propertyId,
      dateRanges: [
        {
          startDate,
          endDate,
        },
      ],
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "sessions" }],
      orderBys: [
        {
          metric: {
            metricName: "sessions",
          },
          desc: true,
        },
      ],
    });

    if (!response.rows) {
      return [];
    }

    const totalSessions = response.rows.reduce((sum, row) => {
      return sum + parseInt(row.metricValues?.[0]?.value || "0");
    }, 0);

    return response.rows.map((row) => {
      const device = row.dimensionValues?.[0]?.value || "Unknown";
      const sessions = parseInt(row.metricValues?.[0]?.value || "0");
      const percentage =
        totalSessions > 0 ? (sessions / totalSessions) * 100 : 0;

      // Map device categories to standard names
      const deviceMapping: { [key: string]: "Desktop" | "Mobile" | "Tablet" } =
        {
          desktop: "Desktop",
          mobile: "Mobile",
          tablet: "Tablet",
        };

      return {
        device: deviceMapping[device.toLowerCase()] || "Desktop",
        sessions,
        percentage: Math.round(percentage * 100) / 100,
      };
    });
  } catch (error) {
    throw handleGAError(error);
  }
}

// Fetch top countries
export async function fetchCountryData(
  startDate: string,
  endDate: string,
  limit: number = 10
): Promise<CountryData[]> {
  try {
    validateDateRange(startDate, endDate);

    const client = createGAClient();
    const propertyId = getGAPropertyId();

    const [response] = await client.runReport({
      property: propertyId,
      dateRanges: [
        {
          startDate,
          endDate,
        },
      ],
      dimensions: [
        { name: "country" },
        { name: "countryId" }, // Country code
      ],
      metrics: [{ name: "sessions" }],
      orderBys: [
        {
          metric: {
            metricName: "sessions",
          },
          desc: true,
        },
      ],
      limit,
    });

    if (!response.rows) {
      return [];
    }

    return response.rows.map((row) => {
      const country = row.dimensionValues?.[0]?.value || "Unknown";
      const countryCode = row.dimensionValues?.[1]?.value || "XX";
      const sessions = parseInt(row.metricValues?.[0]?.value || "0");

      return {
        country,
        countryCode,
        sessions,
      };
    });
  } catch (error) {
    throw handleGAError(error);
  }
}

// Fetch overview metrics with previous period comparison
export async function fetchOverviewMetricsWithComparison(
  startDate: string,
  endDate: string
): Promise<OverviewMetrics> {
  try {
    // Get current period metrics
    const currentMetrics = await fetchOverviewMetrics(startDate, endDate);

    // Calculate previous period dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const periodLength = end.getTime() - start.getTime();

    const prevEnd = new Date(start.getTime() - 24 * 60 * 60 * 1000); // Day before start
    const prevStart = new Date(prevEnd.getTime() - periodLength);

    try {
      const previousMetrics = await fetchOverviewMetrics(
        prevStart.toISOString().split("T")[0],
        prevEnd.toISOString().split("T")[0]
      );

      return {
        ...currentMetrics,
        previousPeriodComparison: previousMetrics,
      };
    } catch (error) {
      // If previous period data fails, return current metrics without comparison
      console.warn("Failed to fetch previous period data:", error);
      return currentMetrics;
    }
  } catch (error) {
    throw handleGAError(error);
  }
}
