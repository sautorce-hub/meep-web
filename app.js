(function () {
  var c = window.MEEP || {};

  var $ = function (id) {
    return document.getElementById(id);
  };

  var each = function (list, fn) {
    Array.prototype.forEach.call(list, fn);
  };

  var ACCOUNT =
    /^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/;


  // =========================
  // HTTPS URL HELPER
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

    if (!a || !url) return;

    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";

    a.classList.remove("off");
    a.removeAttribute("aria-disabled");

    a.textContent = a.getAttribute("data-label");
  }


  // =========================
  // NAVIGATION
  // =========================

  var path =
    location.pathname.replace(/\/$/, "");

  var cur =
    (path.split("/").pop() || "index")
      .replace(/\.html$/, "");


  each(
    document.querySelectorAll(".nav a"),
    function (a) {

      var h =
        a.getAttribute("href");

      if (
        h &&
        h.indexOf("#") === -1 &&
        h.replace(/\.html$/, "") === cur
      ) {

        a.classList.add("on");

        a.setAttribute(
          "aria-current",
          "page"
        );

      }

    }
  );


  // =========================
  // LINKS
  // =========================

  var trade =
    https(c.tradeUrl);

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
    https(c.xUrl)
  );

  enable(
    "telegram",
    https(c.telegramUrl)
  );


  if (
    trade &&
    $("buy-note")
  ) {

    $("buy-note").hidden =
      true;

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


    $("ca-empty").hidden =
      true;


    $("ca-box").hidden =
      false;


    $("ca-text").textContent =
      ca;


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


  // ==================================================
  // AIRDROP
  // ==================================================

  var form =
    $("airdrop-form");


  if (form) {

    enable(
      "follow",
      https(c.xUrl)
    );


    enable(
      "rt-post",
      https(c.airdropTweetUrl)
    );


    var endpoint =
      https(c.airdropEndpoint);


    // ==================================================
    // LOCAL STORAGE KEYS
    // ==================================================

    var STORAGE_SUBMITTED =
      "meep_airdrop_submitted";

    var STORAGE_WALLET =
      "meep_airdrop_wallet";

    var STORAGE_USERNAME =
      "meep_airdrop_username";


    // ==================================================
    // AIRDROP HINT
    // ==================================================

    if (
      $("airdrop-hint")
    ) {

      $("airdrop-hint").textContent =
        endpoint
          ? "Your details are sent to the MEEP team."
          : "This opens X with your details pre-filled as a public post.";

    }


    if (
      !endpoint &&
      $("airdrop-btn")
    ) {

      $("airdrop-btn").textContent =
        "SUBMIT ON X";

    }


    // ==================================================
    // CHECK REGISTRATION
    // CHECK BEFORE POST
    // ==================================================

    function checkRegistration(
      wallet,
      user,
      done
    ) {

      var callbackName =
        "__meepCheck_" +
        Date.now() +
        "_" +
        Math.floor(
          Math.random() * 100000
        );


      var script =
        document.createElement(
          "script"
        );


      var finished =
        false;


      // =========================
      // CLEANUP
      // =========================

      function cleanup() {

        if (
          script.parentNode
        ) {

          script.parentNode
            .removeChild(
              script
            );

        }


        try {

          delete window[
            callbackName
          ];

        } catch (e) {

          window[
            callbackName
          ] = undefined;

        }

      }


      // =========================
      // FINISH
      // =========================

      function finish(data) {

        if (finished) {
          return;
        }


        finished =
          true;


        cleanup();


        done(data);

      }


      // =========================
      // CALLBACK
      // =========================

      window[
        callbackName
      ] =
        function (data) {

          finish(data);

        };


      // =========================
      // ERROR
      // =========================

      script.onerror =
        function () {

          finish({
            success: false,
            registered: false,
            message:
              "Could not verify registration."
          });

        };


      // =========================
      // URL
      // =========================

      var url =
        endpoint +
        "?action=check" +
        "&wallet=" +
        encodeURIComponent(
          wallet
        ) +
        "&x_username=" +
        encodeURIComponent(
          user
        ) +
        "&callback=" +
        encodeURIComponent(
          callbackName
        );


      script.src =
        url;


      document.body.appendChild(
        script
      );


      // =========================
      // TIMEOUT
      // =========================

      setTimeout(
        function () {

          if (!finished) {

            finish({
              success: false,
              registered: false,
              message:
                "Verification timed out."
            });

          }

        },
        10000
      );

    }


    // ==================================================
    // SEND REGISTRATION
    // ==================================================

    function sendRegistration(
      wallet,
      user,
      rt,
      done
    ) {

      var iframe =
        document.createElement(
          "iframe"
        );


      iframe.name =
        "meep-airdrop-" +
        Date.now();


      iframe.style.display =
        "none";


      document.body.appendChild(
        iframe
      );


      var postForm =
        document.createElement(
          "form"
        );


      postForm.method =
        "POST";


      postForm.action =
        endpoint;


      postForm.target =
        iframe.name;


      postForm.style.display =
        "none";


      // =========================
      // FIELD
      // =========================

      function addField(
        name,
        value
      ) {

        var input =
          document.createElement(
            "input"
          );


        input.type =
          "hidden";


        input.name =
          name;


        input.value =
          value;


        postForm.appendChild(
          input
        );

      }


      addField(
        "wallet",
        wallet
      );


      addField(
        "x_username",
        user
      );


      addField(
        "retweet_url",
        rt
      );


      document.body.appendChild(
        postForm
      );


      // =========================
      // SUBMIT
      // =========================

      try {

        postForm.submit();

      } catch (error) {

        cleanup();


        done(
          false,
          "Could not send. Please try again."
        );


        return;

      }


      // =========================
      // WAIT
      // =========================

      setTimeout(
        function () {

          cleanup();


          done(
            true,
            ""
          );

        },
        1800
      );


      // =========================
      // CLEANUP
      // =========================

      function cleanup() {

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


    // ==================================================
    // RESTORE SUBMITTED STATE
    // ==================================================

    var savedSubmitted =
      localStorage.getItem(
        STORAGE_SUBMITTED
      );


    var savedWallet =
      localStorage.getItem(
        STORAGE_WALLET
      );


    var savedUsername =
      localStorage.getItem(
        STORAGE_USERNAME
      );


    if (
      savedSubmitted === "true"
    ) {

      var savedBtn =
        $("airdrop-btn");


      var savedMsg =
        $("airdrop-msg");


      if (savedBtn) {

        savedBtn.textContent =
          "SUBMITTED";

        savedBtn.disabled =
          true;

      }


      if (savedMsg) {

        savedMsg.textContent =
          "✅ Registration already submitted.";

      }


      var fields =
        form.elements;


      if (fields) {

        if (
          fields.wallet &&
          savedWallet
        ) {

          fields.wallet.value =
            savedWallet;

          fields.wallet.readOnly =
            true;

        }


        if (
          fields.x_username &&
          savedUsername
        ) {

          fields.x_username.value =
            "@" + savedUsername;

          fields.x_username.readOnly =
            true;

        }


        if (
          fields.retweet_url
        ) {

          fields.retweet_url.readOnly =
            true;

        }

      }

    }


    // ==================================================
    // SUBMIT
    // ==================================================

    form.addEventListener(
      "submit",
      function (e) {

        e.preventDefault();


        // ==============================================
        // ALREADY SUBMITTED IN THIS BROWSER
        // ==============================================

        if (
          localStorage.getItem(
            STORAGE_SUBMITTED
          ) === "true"
        ) {

          return;

        }


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
        // VALUES
        // =========================

        var wallet =
          String(
            f.wallet.value || ""
          )
            .trim()
            .toLowerCase();


        var user =
          String(
            f.x_username.value || ""
          )
            .trim()
            .replace(
              /^@/,
              ""
            );


        var rt =
          String(
            f.retweet_url.value || ""
          )
            .trim();


        // =========================
        // FAIL
        // =========================

        function fail(text) {

          msg.textContent =
            text;

        }


        // =========================
        // WALLET VALIDATION
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
        // USERNAME VALIDATION
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
        // RETWEET VALIDATION
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


        // ==================================================
        // NO BACKEND
        // ==================================================

        if (!endpoint) {

          var handle =
            "";


          try {

            handle =
              new URL(
                https(c.xUrl)
              )
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
            encodeURIComponent(
              text
            ),
            "_blank",
            "noopener"
          );


          msg.textContent =
            "Post the message on X to finish registering.";


          return;

        }


        // ==================================================
        // STEP 1
        // CHECK BEFORE POST
        // ==================================================

        btn.disabled =
          true;


        btn.textContent =
          "CHECKING...";


        msg.textContent =
          "Checking registration...";


        checkRegistration(
          wallet,
          user,
          function (result) {


            // ==========================================
            // CHECK ERROR
            // ==========================================

            if (
              !result ||
              result.success === false
            ) {

              msg.textContent =
                "❌ " +
                (
                  result &&
                  result.message
                    ? result.message
                    : "Could not verify registration."
                );


              btn.disabled =
                false;


              btn.textContent =
                "SUBMIT";


              return;

            }


            // ==========================================
            // WALLET ALREADY REGISTERED
            // ==========================================

            if (
              result.walletRegistered ===
              true
            ) {

              msg.textContent =
                "❌ This NEAR wallet has already been registered.";


              btn.disabled =
                false;


              btn.textContent =
                "SUBMIT";


              return;

            }


            // ==========================================
            // USERNAME ALREADY REGISTERED
            // ==========================================

            if (
              result.usernameRegistered ===
              true
            ) {

              msg.textContent =
                "❌ This X username has already been registered.";


              btn.disabled =
                false;


              btn.textContent =
                "SUBMIT";


              return;

            }


            // ==========================================
            // STEP 2
            // NOT REGISTERED
            // POST NOW
            // ==========================================

            btn.textContent =
              "SENDING...";


            msg.textContent =
              "Sending...";


            sendRegistration(
              wallet,
              user,
              rt,
              function (
                ok,
                errorMessage
              ) {


                // ======================================
                // POST ERROR
                // ======================================

                if (!ok) {

                  msg.textContent =
                    "❌ " +
                    errorMessage;


                  btn.disabled =
                    false;


                  btn.textContent =
                    "SUBMIT";


                  return;

                }


                // ======================================
                // SAVE LOCAL STATUS
                // ======================================

                localStorage.setItem(
                  STORAGE_SUBMITTED,
                  "true"
                );


                localStorage.setItem(
                  STORAGE_WALLET,
                  wallet
                );


                localStorage.setItem(
                  STORAGE_USERNAME,
                  user
                );


                // ======================================
                // SUCCESS
                // ======================================

                form.reset();


                msg.textContent =
                  "✅ Registration submitted successfully.";


                btn.textContent =
                  "SUBMITTED";


                btn.disabled =
                  true;


                // ======================================
                // LOCK FIELDS
                // ======================================

                if (
                  f.wallet
                ) {

                  f.wallet.value =
                    wallet;

                  f.wallet.readOnly =
                    true;

                }


                if (
                  f.x_username
                ) {

                  f.x_username.value =
                    "@" + user;

                  f.x_username.readOnly =
                    true;

                }


                if (
                  f.retweet_url
                ) {

                  f.retweet_url.readOnly =
                    true;

                }


                // ======================================
                // X SHARE
                // ======================================

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

              }
            );

          }
        );

      }
    );

  }


  // ==================================================
  // SWAP PAGE
  // ==================================================

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


        $("recv").textContent =
          (
            n > 0
              ? n * rate * 0.97
              : 0
          ).toLocaleString(
            undefined,
            {
              maximumFractionDigits: 2
            }
          );

      };


    if (
      $("rate-note")
    ) {

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


    if (
      $("swap-btn")
    ) {

      $("swap-btn").onclick =
        function () {

          $("swap-msg").textContent =
            "Swap is launching soon. Nothing was sent.";

        };

    }

  }


  // ==================================================
  // NFT PAGE
  // ==================================================

  each(
    document.querySelectorAll(
      ".mint"
    ),
    function (b) {

      b.onclick =
        function () {

          if (
            $("nft-msg")
          ) {

            $("nft-msg").textContent =
              "Minting is launching soon. Nothing was minted.";

          }

        };

    }
  );


  // ==================================================
  // COUNTDOWN
  // ==================================================

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
      launch - Date.now();


    if (ms <= 0) {

      box.innerHTML =
        '<p class="live">MEEP IS LIVE</p>';


      clearInterval(
        timer
      );


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
          s % 86400 / 3600
        )
      ],

      [
        "min",
        Math.floor(
          s % 3600 / 60
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
              String(
                p[1]
              ).padStart(
                2,
                "0"
              ) +
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