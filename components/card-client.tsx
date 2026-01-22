"use client";

import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "./ui/button";

type HouseKey = "ghibli" | "sanrio";

export default function CardClient() {
  const [credits, setCredits] = useState<number>(3);
  const [username, setUsername] = useState("");
  const [userChecked, setUserChecked] = useState(false)
  const [botId, setBotId] = useState("pixelw0lf8_55ne0n541");


  const [selected, setSelected] = useState<Record<HouseKey, number>>({
    ghibli: 0,
    sanrio: 0,
  });

  const totalSelected = useMemo(
    () => selected.ghibli + selected.sanrio,
    [selected]
  );

  const remaining = credits - totalSelected;

  const checkUser = async () => {

    const res = await fetch(`http://localhost:3000/api/houses/check?username=${username}&botId=${botId}`,{
      method: "GET"
    })

    if (!res.ok) {
      console.error("Request failed:", res.status);
      return;
    }

    const data = await res.json(); // ✅ THIS is the important part
    console.log(data);
  }

  const onClaim = async (e: React.FormEvent) => {
    e.preventDefault();

    // save selection
    await fetch("/api/houses/preselect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        botId,
        ghibli: selected.ghibli,
        sanrio: selected.sanrio,
      }),
    });

    // then claim 1 house (API picks from selection)
    const res = await fetch("/api/houses/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, botId }),
    });

    const data = await res.json();
    if (!data.success) return toast.error(data.reason ?? data.error ?? "Failed");

    toast.success(`Claimed: ${data.houseType}`);
  };


  const handleHouseSelection = (house: HouseKey, delta: 1 | -1) => {
    setSelected((prev) => {
      const current = prev[house];

      // prevent going below 0
      if (delta === -1 && current === 0) return prev;

      // prevent exceeding credits
      if (delta === 1 && totalSelected >= credits) {
        toast.error("No credits left.");
        return prev;
      }

      return {
        ...prev,
        [house]: current + delta,
      };
    });
  };

  return (
    <Card className="border border-border rounded-lg ">
      <CardHeader>
        <CardTitle>Hello!</CardTitle>
        <CardDescription>
            <div>
                Remaining credits: {remaining}
            </div>
            <div>
                Restocking credits in: 2 hrs 52 min
            </div>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form>
          <div>
            <label htmlFor="username">Username</label>
            <div className="flex items-center gap-4 mt-4">
                <Input id="username" type="text" className="" value={username} onChange={(e) => setUsername(e.target.value)} />
                <Button variant={"outline"} type="button" onClick={checkUser}>Check</Button>
            </div>
          </div>

          <div className="grid grid-cols-2 mt-10 gap-10">
            {/* GHIBLI */}
            <div>
              <p className="text-center">Ghibli House</p>

              <Image
                src="/ghiblihouse.png"
                alt="Ghibli house"
                width={1080}
                height={420}
                className="w-full h-auto rounded-md"
              />

              <div className="flex items-center justify-center gap-4 mt-2">
                <button
                  type="button"
                  className="border border-border px-4 py-2"
                  onClick={() => handleHouseSelection("ghibli", -1)}
                >
                  -
                </button>

                <p>{selected.ghibli}</p>

                <button
                  type="button"
                  className="border border-border px-4 py-2"
                  onClick={() => handleHouseSelection("ghibli", 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* SANRIO */}
            <div>
              <p className="text-center">Sanrio House</p>

              <Image
                src="/ghiblihouse.png"
                alt="Sanrio house"
                width={1080}
                height={420}
                className="w-full h-auto rounded-md"
              />

              <div className="flex items-center justify-center gap-4 mt-2">
                <button
                  type="button"
                  className="border border-border px-4 py-2"
                  onClick={() => handleHouseSelection("sanrio", -1)}
                >
                  -
                </button>

                <p>{selected.sanrio}</p>

                <button
                  type="button"
                  className="border border-border px-4 py-2"
                  onClick={() => handleHouseSelection("sanrio", 1)}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
                <Button variant={"outline"} className="mt-10" type="submit" onClick={onClaim}>Claim House</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
