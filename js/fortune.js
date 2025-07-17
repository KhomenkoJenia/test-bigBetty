const perfectHalf = ((1 / 37) * 360) / 2;
let currentLength = perfectHalf;

$(document).ready(function () {
  $(".wheel img").css({
    transform: "rotate(" + currentLength + "deg)",
    transition: "none",
  });

  $(".spin").click(() => {
    const randomSector = getRandomInt(0, 36);
    const fullSpins = getRandomInt(3, 4);
    const anglePerSector = 360 / 37;
    const spininterval = randomSector * anglePerSector + fullSpins * 360;

    currentLength += spininterval;

    $(".wheel img").css({
      transition: "transform 3s ease-out",
      transform: "rotate(" + currentLength + "deg)",
    });
  });
});

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
