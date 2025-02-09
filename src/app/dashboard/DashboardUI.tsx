"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
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
  price_action: PriceAction[];
  ticker_metadata: TickerMetadata;
  ticker_details: any;
}

export default function DashboardUI() {
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

  console.log("tickerData", tickerData);

  const SecFilings = () =>
    tickerData?.ticker_details?.secFilings ? (
      tickerData?.ticker_details?.secFilings?.filings?.map(
        (filing: any, index: number) => (
          <TableRow key={index}>
            <TableCell>{new Date(filing.date).toLocaleDateString()}</TableCell>
            <TableCell>{filing.type}</TableCell>
            <TableCell>{filing.description}</TableCell>
            <TableCell>
              <a
                href={filing.url}
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
    ) : <></>;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {error && <span>{error}</span>}
      <div className="max-w-[1200px] mx-auto space-y-6">
        <Select value={selectedTicker} onValueChange={setSelectedTicker}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select a ticker" />
          </SelectTrigger>
          <SelectContent>
            {MAG7_TICKERS.map((ticker) => (
              <SelectItem key={ticker.value} value={ticker.value}>
                {ticker.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {tickerData && (
          <>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 relative">
                <Image
                  src={
                    tickerData.ticker_metadata.logo_url || "/placeholder.svg"
                  }
                  alt={`${tickerData.ticker_metadata.name} logo`}
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {tickerData.ticker_metadata.symbol}
                </h1>
                <p className="text-muted-foreground">
                  {tickerData.ticker_metadata.tv_exchange}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Market Cap</p>
                  <p className="text-2xl font-bold">
                    {formatMarketCap(tickerData.ticker_metadata.market_cap)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Volume</p>
                  <p className="text-2xl font-bold">
                    {tickerData.price_action[
                      tickerData.price_action.length - 1
                    ].volume.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Day Range</p>
                  <p className="text-2xl font-bold">
                    ${tickerData.price_action[0].low.toFixed(2)} - $
                    {tickerData.price_action[0].high.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Current Price</p>
                  <p className="text-2xl font-bold">
                    $
                    {tickerData.price_action[
                      tickerData.price_action.length - 1
                    ].close.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="p-4">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={tickerData.price_action}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={formatDate}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="close"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SecFilings />
                </TableBody>
              </Table>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
