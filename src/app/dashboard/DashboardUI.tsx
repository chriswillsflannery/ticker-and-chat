"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "../util/axios";
import { useAuth } from "../context/AuthContext";

const MAG7_TICKERS = [
  { value: "META", label: "Meta Platforms Inc." },
  { value: "AAPL", label: "Apple Inc." },
  { value: "GOOGL", label: "Alphabet Inc." },
  { value: "AMZN", label: "Amazon.com Inc." },
  { value: "MSFT", label: "Microsoft Corporation" },
  { value: "NVDA", label: "NVIDIA Corporation" },
  { value: "TSLA", label: "Tesla Inc." },
];

interface PriceAction {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: string;
}

interface TickerMetadata {
  symbol: string;
  exchange: string;
  name: string;
  logo_url: string;
  market_cap: number;
  tv_exchange: string;
}

interface TickerResponse {
  ticker: string;
  price_action: PriceAction[];
  ticker_metadata: TickerMetadata;
  ticker_details: any;
}

export default function DashboardUI() {
  const [selectedView, setSelectedView] = useState<"keystats" | "chat">(
    "keystats",
  );
  const [selectedTicker, setSelectedTicker] = useState<string>("META");
  const [tickerData, setTickerData] = useState<TickerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accessToken } = useAuth();

  useEffect(() => {
    if (!accessToken) return;

    const fetchTickerData = async () => {
      setLoading(true);
      try {
        const res = await api.post(
          `/ticker`,
          {
            data: { selectedTicker },
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (res.status !== 200) {
          setError("Something went wrong.");
          return;
        }

        const data = res.data;
        setTickerData(data);
      } catch (error) {
        console.error("Error fetching ticker data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickerData();
  }, [selectedTicker, accessToken]);

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const PriceChart = () => {
    return (
      <Card className="bg-card shadow-lg">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-semibold tracking-tight">
            Price History
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Historical price movement over time
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={tickerData?.price_action}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="rgb(34 197 94)"
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor="rgb(34 197 94)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatDate}
                  stroke="#71717a"
                  className="text-xs"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#71717a"
                  className="text-xs"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    borderColor: "#e4e4e7",
                    borderRadius: "0.5rem",
                  }}
                  labelClassName="text-zinc-500"
                />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke="rgb(34 197 94)"
                  fill="url(#colorGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  };

  const SecFilings = () =>
    tickerData?.ticker_details?.secFilings ? (
      tickerData?.ticker_details?.secFilings?.filings?.map(
        (filing: any, index: number) => (
          <TableRow key={index}>
            <TableCell>{new Date(filing.date).toLocaleDateString()}</TableCell>
            <TableCell>{filing.type}</TableCell>
            <TableCell className="max-w-[200px]">{filing.title}</TableCell>
            <TableCell>
              <a
                href={filing.edgarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View
              </a>
            </TableCell>
          </TableRow>
        ),
      )
    ) : (
      <></>
    );

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {error && <span>{error}</span>}
      <div className="max-w-[1200px] mx-auto space-y-6">
        {selectedView === "keystats" && (
          <>
            <Select value={selectedTicker} onValueChange={setSelectedTicker}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a ticker" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                {MAG7_TICKERS.map((ticker) => (
                  <SelectItem
                    className="bg-background cursor-pointer"
                    key={ticker.value}
                    value={ticker.value}
                  >
                    {ticker.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {loading && (
              <h3>
                Beautiful skeleton loaders coming soon...
              </h3>
            )}
            {tickerData && !loading && (
              <>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 relative">
                    <Image
                      src={
                        tickerData.ticker_metadata.logo_url ||
                        "/placeholder.svg"
                      }
                      alt={`${tickerData.ticker_metadata.name} logo`}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">
                      {tickerData.ticker}
                    </h1>
                    <p className="text-muted-foreground">
                      {tickerData.ticker_metadata.tv_exchange}
                    </p>
                  </div>
                </div>
              </>
            )}
          </>
        )}
        <div
          className={`${
            selectedView === "chat"
              ? "z-50 bg-background shadow-md"
              : "relative"
          } transition-all duration-500`}
        >
          <Tabs
            defaultValue={selectedView}
            onValueChange={(e) => setSelectedView(e)}
            className="w-full"
          >
            <div className="relative mb-4">
              <div className="absolute bottom-0 w-full h-[2px] bg-gray-200" />
              <TabsList className="relative w-full bg-transparent flex justify-start">
                <TabsTrigger
                  value="keystats"
                  className="relative w-[100px] data-[state=active]:text-red-500 after:absolute after:bottom-[-5px] after:left-[-4] after:right-[-4] after:h-[4px] after:bg-red-500 data-[state=active]:after:block after:hidden"
                >
                  Key Stats
                </TabsTrigger>
                <TabsTrigger
                  value="chat"
                  className="relative w-[100px] data-[state=active]:text-red-500 after:absolute after:bottom-[-5px] after:left-[-4] after:right-[-4] after:h-[4px] after:bg-red-500 data-[state=active]:after:block after:hidden"
                >
                  Chat
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent
              value="keystats"
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">
                      Market Cap
                    </p>
                    <p className="text-2xl font-bold">
                      {formatMarketCap(
                        tickerData?.ticker_metadata.market_cap ?? 0
                      )}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">
                      Volume
                    </p>
                    <p className="text-2xl font-bold">
                      {tickerData?.price_action[
                        tickerData.price_action.length - 1
                      ].volume.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">
                      Day Range
                    </p>
                    <p className="text-2xl font-bold">
                      $
                      {tickerData?.price_action[0].low.toFixed(2)} - $
                      {tickerData?.price_action[0].high.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">
                      Current Price
                    </p>
                    <p className="text-2xl font-bold">
                      $
                      {tickerData?.price_action[
                        tickerData?.price_action.length - 1
                      ].close.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <PriceChart />

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Link</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <SecFilings />
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>
            <TabsContent value="chat">
              Chat with an Agent
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
