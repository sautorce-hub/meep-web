(function () {
  "use strict";

  var c = window.MEEP || {};

  var $ = function (id) {
    return document.getElementById(id);
  };

  var each = function (list, fn) {
    Array.prototype.forEach.call(list, fn);
  };

  var ACCOUNT =
    /^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/i;


  // =========================
  // URL HELPER
  // =========================

  function https(v) {
    try {
      var u = new URL(String(v || "").trim());

      return u.protocol === "https:"
        ? u.href
        : "";

    } catch (e) {
      return "";
    }
  }


  // =========================
  // ENABLE LINK
  // =========================

  function enable(id, url) {
    var a = $(id);

    if (!a || !url) {
      return false;
    }

    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";

    a.classList.remove("off");
    a.removeAttribute("aria-disabled");

    var label = a.getAttribute("data-label");

    if (label) {
      a.textContent = label;
    }

    return true;
  }


  // =========================
  // ACTIVE NAV
  // =========================

  function normalizePath(path) {

    path =
      String(path || "/")
        .split("?")[0]
        .split("#")[0];

    if (
      path.length > 1 &&
      path.charAt(path.length - 1) === "/"
    ) {
      path = path.slice(0, -1);
    }

    if (!path) {
      path = "/";
    }

    return path;
  }


  var currentPath =
    normalizePath(location.pathname);


  each(
    document.querySelectorAll(".nav a"),
    function (a) {

      var href =
        a.getAttribute("href");

      if (
        !href ||
        href.charAt(0) === "#"
      ) {
        return;
      }

      try {

        var target =
          new URL(
            href,
            location.href
          );

        var targetPath =
          normalizePath(
            target.pathname
          );

        if (
          targetPath === currentPath
        ) {

          a.classList.add("on");

          a.setAttribute(
            "aria-current",
            "page"
          );

        }

      } catch (e) {}

    }
  );


  // =========================
  // GENERAL LINKS
  // =========================

  var trade =
    https(c.tradeUrl);

  var xUrl =
    https(c.xUrl) ||
    "https://x.com/MEEPNear";

  var telegramUrl =
    https(c.telegramUrl);


  enable(
    "buy",
    trade
  );

  enable(
    "nearly",
    trade
  );

  enable(
    "x",
    xUrl
  );

  enable(
    "telegram",
    telegramUrl
  );


  if (
    trade &&
    $("buy-note")
  ) {

    $("buy-note").hidden = true;

  }


  // =========================
  // CONTRACT
  // =========================

  var ca =
    String(c.contract || "")
      .trim()
      .toLowerCase();


  if (
    $("ca-title") &&
    ca.length >= 2 &&
    ca.length <= 64 &&
    ACCOUNT.test(ca)
  ) {

    $("ca-title").textContent =
      "MEEP CONTRACT";


    if ($("ca-empty")) {
      $("ca-empty").hidden = true;
    }


    if ($("ca-box")) {
      $("ca-box").hidden = false;
    }


    if ($("ca-text")) {
      $("ca-text").textContent = ca;
    }


    var host =
      c.network === "testnet"
        ? "testnet.nearblocks.io"
        : "nearblocks.io";


    enable(
      "explorer",
      "https://" +
      host +
      "/address/" +
      ca
    );


    if ($("copy")) {

      $("copy").onclick =
        function () {

          if (
            !navigator.clipboard
          ) {
            return;
          }


          navigator.clipboard
            .writeText(ca)
            .then(
              function () {

                $("copy").textContent =
                  "COPIED";


                setTimeout(
                  function () {

                    $("copy").textContent =
                      "COPY";

                  },
                  1500
                );

              }
            )
            .catch(
              function () {}
            );

        };

    }

  }


  // =========================
  // AIRDROP
  // =========================

  var form =
    $("airdrop-form");


  if (form) {

    var airdropTweetUrl =
      https(c.airdropTweetUrl) ||
      "";


    // FOLLOW ON X
    enable(
      "follow",
      xUrl
    );


    // RETWEET POST
    if (airdropTweetUrl) {

      enable(
        "rt-post",
        airdropTweetUrl
      );

    }


    var endpoint =
      https(c.airdropEndpoint);


    if ($("airdrop-hint")) {

      $("airdrop-hint").textContent =
        endpoint
          ? "Your details are sent to the MEEP team."
          : "Submit your details on X to finish registering.";

    }


    if (
      !endpoint &&
      $("airdrop-btn")
    ) {

      $("airdrop-btn").textContent =
        "SUBMIT ON X";

    }


    // =========================
    // AIRDROP SUBMIT
    // =========================

    form.addEventListener(
      "submit",
      function (e) {

        e.preventDefault();


        var f =
          form.elements;

        var msg =
          $("airdrop-msg");

        var btn =
          $("airdrop-btn");


        if (
          !f ||
          !msg ||
          !btn
        ) {
          return;
        }


        // =========================
        // HONEYPOT
        // =========================

        if (
          f.website &&
          f.website.value
        ) {

          return;

        }


        // =========================
        // FORM VALUES
        // =========================

        var wallet =
          String(
            f.wallet &&
            f.wallet.value ||
            ""
          )
            .trim()
            .toLowerCase();


        var user =
          String(
            f.x_username &&
            f.x_username.value ||
            ""
          )
            .trim()
            .replace(/^@/, "");


        var rt =
          String(
            f.retweet_url &&
            f.retweet_url.value ||
            ""
          )
            .trim();


        function fail(t) {

          msg.textContent = t;

        }


        // =========================
        // VALIDATE WALLET
        // =========================

        if (
          !(
            wallet.length >= 2 &&
            wallet.length <= 64 &&
            ACCOUNT.test(wallet)
          )
        ) {

          return fail(
            "Enter a valid NEAR wallet address."
          );

        }


        // =========================
        // VALIDATE X USERNAME
        // =========================

        if (
          !/^[A-Za-z0-9_]{1,15}$/.test(
            user
          )
        ) {

          return fail(
            "Enter your X username (letters, numbers, underscore)."
          );

        }


        // =========================
        // VALIDATE RETWEET URL
        // =========================

        if (
          !/^https:\/\/(www\.|mobile\.)?(x|twitter)\.com\/[A-Za-z0-9_]{1,15}\/status\/\d+/i.test(
            rt
          )
        ) {

          return fail(
            "Paste a link to your post on X (https://x.com/you/status/...)."
          );

        }


        // =========================
        // NO BACKEND
        // =========================

        if (!endpoint) {

          var handle = "";


          try {

            handle =
              new URL(xUrl)
                .pathname
                .split("/")[1] ||
              "";

          } catch (x) {}


          var text =
            "Airdrop registration" +
            (
              handle
                ? " @" + handle
                : ""
            ) +
            "\nWallet: " +
            wallet +
            "\nX: @" +
            user +
            "\nRetweet: " +
            rt;


          window.open(
            "https://x.com/intent/post?text=" +
            encodeURIComponent(text),
            "_blank",
            "noopener"
          );


          msg.textContent =
            "Post the message on X to finish registering.";

          return;

        }


        // =========================
        // GOOGLE APPS SCRIPT
        // CROSS-ORIGIN POST
        // =========================

        btn.disabled = true;

        msg.textContent =
          "Sending...";


        // Create unique iframe name
        var iframeName =
          "meep_airdrop_" +
          Date.now();


        // Create hidden iframe
        var iframe =
          document.createElement("iframe");


        iframe.name =
          iframeName;


        iframe.id =
          iframeName;


        iframe.style.display =
          "none";


        document.body.appendChild(
          iframe
        );


        // Create temporary POST form
        var postForm =
          document.createElement("form");


        postForm.method =
          "POST";


        postForm.action =
          endpoint;


        postForm.target =
          iframeName;


        postForm.style.display =
          "none";


        // =========================
        // WALLET
        // =========================

        var walletInput =
          document.createElement("input");


        walletInput.type =
          "hidden";


        walletInput.name =
          "wallet";


        walletInput.value =
          wallet;


        postForm.appendChild(
          walletInput
        );


        // =========================
        // X USERNAME
        // =========================

        var userInput =
          document.createElement("input");


        userInput.type =
          "hidden";


        userInput.name =
          "x_username";


        userInput.value =
          user;


        postForm.appendChild(
          userInput
        );


        // =========================
        // RETWEET URL
        // =========================

        var retweetInput =
          document.createElement("input");


        retweetInput.type =
          "hidden";


        retweetInput.name =
          "retweet_url";


        retweetInput.value =
          rt;


        postForm.appendChild(
          retweetInput
        );


        // Add form to page
        document.body.appendChild(
          postForm
        );


        // =========================
        // SUBMIT
        // =========================

        try {

          postForm.submit();


          /*
           * We cannot read the Google Apps
           * Script response from another domain.
           *
           * The POST itself is sent directly
           * to the Apps Script endpoint.
           */


          setTimeout(
            function () {

              form.reset();


              msg.textContent =
                "Registration submitted successfully!";


              btn.textContent =
                "SUBMITTED";


              btn.disabled = true;


              // Clean temporary elements
              if (
                postForm.parentNode
              ) {

                postForm.parentNode
                  .removeChild(
                    postForm
                  );

              }


              if (
                iframe.parentNode
              ) {

                iframe.parentNode
                  .removeChild(
                    iframe
                  );

              }


              // =========================
              // SHARE ON X
              // =========================

              var shareText =
                "I just joined the @MEEPNear airdrop! 🐸🚀\n\n" +
                "Join the MEEP community and don't miss the airdrop!\n\n" +
                "#Airdrop #MEEP #Memecoin #NEAR #NEARProtocol #Crypto #Web3";


              var shareUrl =
                "https://x.com/intent/post?text=" +
                encodeURIComponent(
                  shareText
                );


              setTimeout(
                function () {

                  window.location.href =
                    shareUrl;

                },
                800
              );


            },
            1200
          );


        } catch (error) {

          msg.textContent =
            "❌ Could not send. Please try again.";


          btn.disabled = false;


          if (
            postForm.parentNode
          ) {

            postForm.parentNode
              .removeChild(
                postForm
              );

          }


          if (
            iframe.parentNode
          ) {

            iframe.parentNode
              .removeChild(
                iframe
              );

          }

        }

      }
    );

  }


  // =========================
  // SWAP PREVIEW
  // =========================

  var pay =
    $("pay");


  if (pay) {

    var rate =
      Number(c.previewRate) > 0
        ? Number(c.previewRate)
        : 1000;


    var calc =
      function () {

        var n =
          Math.min(
            parseFloat(
              pay.value
            ) || 0,
            1e9
          );


        if ($("recv")) {

          $("recv").textContent =
            (
              n > 0
                ? n * rate * 0.97
                : 0
            )
            .toLocaleString(
              undefined,
              {
                maximumFractionDigits: 2
              }
            );

        }

      };


    if ($("rate-note")) {

      $("rate-note").textContent =
        "Preview rate: 1 NEAR = " +
        rate.toLocaleString() +
        " MEEP. A placeholder until launch, not a live price.";

    }


    pay.addEventListener(
      "input",
      calc
    );


    calc();


    if ($("swap-btn")) {

      $("swap-btn").onclick =
        function () {

          $("swap-msg").textContent =
            "Swap is launching soon. Nothing was sent.";

        };

    }

  }


  // =========================
  // NFT PAGE
  // =========================

  each(
    document.querySelectorAll(".mint"),
    function (b) {

      b.onclick =
        function () {

          if ($("nft-msg")) {

            $("nft-msg").textContent =
              "Minting is launching soon. Nothing was minted.";

          }

        };

    }
  );


  // =========================
  // COUNTDOWN
  // =========================

  var box =
    $("countdown");


  var launch =
    new Date(
      String(
        c.launchDate || ""
      ).trim()
    );


  var timer;


  function tick() {

    if (!box) {
      return;
    }


    var ms =
      launch -
      Date.now();


    if (ms <= 0) {

      box.innerHTML =
        '<p class="live">MEEP IS LIVE</p>';


      clearInterval(timer);

      return;

    }


    var s =
      Math.floor(
        ms / 1000
      );


    var parts = [

      [
        "days",
        Math.floor(
          s / 86400
        )
      ],

      [
        "hrs",
        Math.floor(
          (s % 86400) / 3600
        )
      ],

      [
        "min",
        Math.floor(
          (s % 3600) / 60
        )
      ],

      [
        "sec",
        s % 60
      ]

    ];


    box.innerHTML =
      parts
        .map(
          function (p) {

            return (
              "<div><b>" +
              String(p[1])
                .padStart(2, "0") +
              "</b><span>" +
              p[0] +
              "</span></div>"
            );

          }
        )
        .join("");

  }


  if (
    box &&
    c.launchDate &&
    !isNaN(launch)
  ) {

    timer =
      setInterval(
        tick,
        1000
      );


    tick();

  }

})();
