"use client";

import { useEffect, useState } from "react";
import { Joyride, CallBackProps, STATUS, Step, EVENTS, ACTIONS } from "react-joyride";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

// Check if window is defined (for SSR)
const isBrowser = typeof window !== "undefined";

export function TourProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const steps: Step[] = [
    {
      target: "#tour-theme",
      content: "Welcome! You can switch between Light and Dark mode right here.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: "#tour-notifications",
      content: "Check your system alerts and notifications here.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: "#tour-profile",
      content: "Click here to access your personal Profile and Security settings. Let's go there next!",
      placement: "bottom-end",
      spotlightClicks: true,
      disableBeacon: true,
    },
    // The tour transitions to the profile page
    {
      target: "#tour-basic-info",
      content: "Here is your basic profile information. You can update your details anytime.",
      placement: "right",
      disableBeacon: true,
    },
    {
      target: "#tour-security",
      content: "This is your Security control panel. Keep your account secure by managing passwords and access logs.",
      placement: "left",
      disableBeacon: true,
    },
    // The tour transitions to the sidebar
    {
      target: "#tour-sidebar-nav",
      content: "Use the sidebar to navigate the system! Here you'll find everything from Departments to Application Tracking.",
      placement: "right",
      disableBeacon: true,
    }
  ];

  useEffect(() => {
    if (!isBrowser || !session?.user) return;

    // Check if the user has completed the tour
    const hasCompletedTour = localStorage.getItem("tour_completed");
    
    if (!hasCompletedTour) {
      // Small delay to ensure the DOM is painted
      const timer = setTimeout(() => {
        setRun(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [session, pathname]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, index, status, type } = data;
    console.log("Joyride Event:", { action, index, status, type });

    if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
      setRun(false);
      localStorage.setItem("tour_completed", "true");
    } else if (([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND] as string[]).includes(type)) {
      
      if (action === ACTIONS.CLOSE) {
        setRun(false);
        localStorage.setItem("tour_completed", "true");
      } else if (action === ACTIONS.NEXT && index === 2) {
        // Special case: Move to Profile Page
        setRun(false); // Pause tour
        const profilePath = session?.user.role === "ADMIN" ? "/admin/profile" : "/user/profile";
        router.push(profilePath);
        
        setTimeout(() => {
          setStepIndex(3);
          setRun(true);
        }, 1500);
      } else if (action === ACTIONS.NEXT) {
        setStepIndex(index + 1);
      } else if (action === ACTIONS.PREV) {
        setStepIndex(index - 1);
      }
    }
  };

  return (
    <>
      <Joyride
        callback={handleJoyrideCallback}
        continuous
        run={run}
        stepIndex={stepIndex}
        steps={steps}
        scrollToFirstStep
        showProgress
        showSkipButton
        disableOverlayClose
        styles={{
          options: {
            primaryColor: "#2563eb",
            textColor: "#334155",
            zIndex: 1000,
          },
          beaconInner: {
            backgroundColor: "#ffffff",
          },
          beaconOuter: {
            backgroundColor: "rgba(255, 255, 255, 0.4)",
            border: "2px solid #ffffff",
          },
          tooltipContainer: {
            textAlign: "left"
          },
          buttonNext: {
            backgroundColor: "#2563eb",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: "bold",
          },
          buttonBack: {
            marginRight: 10,
            color: "#64748b",
            fontSize: "12px",
            fontWeight: "bold",
          },
          buttonSkip: {
            color: "#94a3b8",
            fontSize: "12px",
            fontWeight: "bold",
          }
        }}
      />
      {children}
    </>
  );
}
