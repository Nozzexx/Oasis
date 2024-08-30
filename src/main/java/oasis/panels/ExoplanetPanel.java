package oasis.panels;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import javafx.animation.AnimationTimer;
import javafx.application.Platform;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.collections.transformation.FilteredList;
import javafx.collections.transformation.SortedList;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Node;
import javafx.scene.control.ComboBox;
import javafx.scene.control.Label;
import javafx.scene.control.ListCell;
import javafx.scene.control.ListView;
import javafx.scene.control.Slider;
import javafx.scene.control.Tab;
import javafx.scene.control.TabPane;
import javafx.scene.control.TextField;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Pane;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.scene.shape.Line;

public class ExoplanetPanel implements ContentPanel {
    private final BorderPane content;
    private final ListView<Exoplanet> exoplanetListView;
    private final TabPane detailsPane;
    private final HBox statisticsPane;
    private final Pane visualizationPane;
    private final TextField searchField;
    private final ComboBox<String> sortComboBox;
    private final ObservableList<Exoplanet> exoplanets = FXCollections.observableArrayList();
    private final Map<String, AnimationTimer> animationTimers = new HashMap<>();
    private Slider speedSlider;
    private static final double BASE_SPEED = 0.1; // Base speed factor
    

    private static final String API_URL = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=";

    public ExoplanetPanel() {
        content = new BorderPane();
        content.setPadding(new Insets(20));
        content.setStyle("-fx-background-color: #2C3E50;");

        // Title
        Label titleLabel = new Label("Exoplanet Explorer");
        titleLabel.setStyle("-fx-font-size: 28px; -fx-font-weight: bold; -fx-text-fill: white;");
        content.setTop(titleLabel);

        // Exoplanet List with Search and Sort
        VBox leftPane = new VBox(10);
        leftPane.setPrefWidth(250); // Set a preferred width for the left pane
        searchField = new TextField();
        searchField.setPromptText("Search exoplanets");
        sortComboBox = new ComboBox<>(FXCollections.observableArrayList("Name", "Distance", "Size"));
        sortComboBox.setPromptText("Sort by");
        exoplanetListView = createExoplanetListView();
        VBox.setVgrow(exoplanetListView, javafx.scene.layout.Priority.ALWAYS); // This makes the ListView expand vertically
        leftPane.getChildren().addAll(searchField, sortComboBox, exoplanetListView);
        content.setLeft(leftPane);

        // Details Pane
        detailsPane = createDetailsPane();
        content.setCenter(detailsPane);

        // Statistics Pane
        statisticsPane = createStatisticsPane();
        
        // Visualization Pane
        visualizationPane = createVisualizationPane();

        // Add listeners for pane resizing
        visualizationPane.widthProperty().addListener((obs, oldVal, newVal) -> {
            if (exoplanetListView.getSelectionModel().getSelectedItem() != null) {
                updateVisualization(exoplanetListView.getSelectionModel().getSelectedItem());
            }
        });
        visualizationPane.heightProperty().addListener((obs, oldVal, newVal) -> {
            if (exoplanetListView.getSelectionModel().getSelectedItem() != null) {
                updateVisualization(exoplanetListView.getSelectionModel().getSelectedItem());
            }
        });

        // Create speed slider
        speedSlider = new Slider(0.1, 10, 1);
        speedSlider.setShowTickLabels(true);
        speedSlider.setShowTickMarks(true);

        Label speedLabel = new Label("Animation Speed:");
        speedLabel.setStyle("-fx-text-fill: white;");

        HBox sliderBox = new HBox(10, speedLabel, speedSlider);
        sliderBox.setAlignment(Pos.CENTER);
        sliderBox.setPadding(new Insets(10, 0, 0, 0));

        // Combine Visualization, Slider, and Statistics in a VBox
        VBox rightPane = new VBox(10);
        rightPane.getChildren().addAll(visualizationPane, sliderBox, statisticsPane);
        content.setRight(rightPane);

        // Initialize data and set up listeners
        initializeData();
        setupListeners();
    }

    private ListView<Exoplanet> createExoplanetListView() {
        ListView<Exoplanet> listView = new ListView<>();
        listView.setPrefWidth(250);
        listView.setCellFactory(lv -> new ListCell<>() {
            @Override
            protected void updateItem(Exoplanet item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) {
                    setText(null);
                } else {
                    setText(item.getName());
                }
            }
        });
        return listView;
    }

    private TabPane createDetailsPane() {
        TabPane tabPane = new TabPane();
        tabPane.setTabClosingPolicy(TabPane.TabClosingPolicy.UNAVAILABLE);

        Tab overviewTab = new Tab("Overview");
        VBox overviewContent = new VBox(10);
        overviewContent.setPadding(new Insets(10));
        overviewContent.setStyle("-fx-background-color: #34495E;");
        Label nameLabel = new Label("Select an exoplanet");
        nameLabel.setStyle("-fx-font-size: 20px; -fx-font-weight: bold; -fx-text-fill: white;");
        Label descriptionLabel = new Label("Exoplanet details will appear here");
        descriptionLabel.setStyle("-fx-font-size: 14px; -fx-text-fill: #BDC3C7; -fx-wrap-text: true;");
        overviewContent.getChildren().addAll(nameLabel, descriptionLabel);
        overviewTab.setContent(overviewContent);

        Tab characteristicsTab = new Tab("Characteristics");
        GridPane characteristicsGrid = new GridPane();
        characteristicsGrid.setHgap(10);
        characteristicsGrid.setVgap(10);
        characteristicsGrid.setPadding(new Insets(10));
        characteristicsGrid.setStyle("-fx-background-color: #34495E;");
        characteristicsTab.setContent(characteristicsGrid);

        tabPane.getTabs().addAll(overviewTab, characteristicsTab);
        return tabPane;
    }

    private HBox createStatisticsPane() {
        HBox statsBox = new HBox(20);
        statsBox.setAlignment(Pos.CENTER);
        statsBox.setPadding(new Insets(10));
        statsBox.setStyle("-fx-background-color: #34495E; -fx-background-radius: 10;");

        addStatistic(statsBox, "Total Discovered", "4,575");
        addStatistic(statsBox, "Potentially Habitable", "24");
        addStatistic(statsBox, "Super-Earths", "1,654");
        addStatistic(statsBox, "Gas Giants", "1,537");

        return statsBox;
    }

    private void addStatistic(HBox container, String label, String value) {
        VBox statBox = new VBox(5);
        statBox.setAlignment(Pos.CENTER);

        Label statLabel = new Label(label);
        statLabel.setStyle("-fx-font-size: 14px; -fx-text-fill: #BDC3C7;");

        Label statValue = new Label(value);
        statValue.setStyle("-fx-font-size: 18px; -fx-font-weight: bold; -fx-text-fill: white;");

        statBox.getChildren().addAll(statValue, statLabel);
        container.getChildren().add(statBox);
    }

    private Pane createVisualizationPane() {
        Pane visPane = new Pane();
        visPane.setPrefSize(400, 400);
        visPane.setStyle("-fx-background-color: #2C3E50; -fx-border-color: #34495E; -fx-border-width: 2; -fx-border-radius: 10;");

        Label placeholderLabel = new Label("Exoplanet System Visualization");
        placeholderLabel.setStyle("-fx-font-size: 16px; -fx-text-fill: #BDC3C7;");
        placeholderLabel.setLayoutX(100);
        placeholderLabel.setLayoutY(190);

        visPane.getChildren().add(placeholderLabel);
        return visPane;
    }

    private void fetchExoplanetsFromAPI() {
        String query = "select pl_name, pl_orbper, pl_rade, discoverymethod, disc_facility from ps where default_flag=1";
        String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
        String apiUrl = API_URL + encodedQuery + "&format=json";
    
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl))
                .build();
    
        client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenApply(HttpResponse::body)
                .thenAccept(this::parseExoplanetsJson)
                .join();
    }

    private void updateStatistics() {
        int totalDiscovered = exoplanets.size();
        int potentiallyHabitable = (int) exoplanets.stream()
            .filter(e -> e.getOrbitalPeriod() > 200 && e.getOrbitalPeriod() < 500 && e.getSize() < 2)
            .count();
        int superEarths = (int) exoplanets.stream()
            .filter(e -> e.getSize() > 1 && e.getSize() <= 2)
            .count();
        int gasGiants = (int) exoplanets.stream()
            .filter(e -> e.getSize() > 2)
            .count();
    
        ((Label) ((VBox) statisticsPane.getChildren().get(0)).getChildren().get(0)).setText(String.valueOf(totalDiscovered));
        ((Label) ((VBox) statisticsPane.getChildren().get(1)).getChildren().get(0)).setText(String.valueOf(potentiallyHabitable));
        ((Label) ((VBox) statisticsPane.getChildren().get(2)).getChildren().get(0)).setText(String.valueOf(superEarths));
        ((Label) ((VBox) statisticsPane.getChildren().get(3)).getChildren().get(0)).setText(String.valueOf(gasGiants));
    }

    private void parseExoplanetsJson(String jsonString) {
    try {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode rootNode = mapper.readTree(jsonString);
        
        exoplanets.clear();
        for (JsonNode node : rootNode) {
            String name = node.get("pl_name").asText();
            double orbitalPeriod = node.get("pl_orbper").asDouble();
            double size = node.get("pl_rade").asDouble();
            String discoveryMethod = node.get("discoverymethod").asText();
            String discoveryFacility = node.get("disc_facility").asText();
            String description = "Discovered by " + discoveryMethod + " at " + discoveryFacility;
            
            exoplanets.add(new Exoplanet(name, orbitalPeriod, size, description));
        }
        
        Platform.runLater(() -> {
            exoplanetListView.setItems(FXCollections.observableArrayList(exoplanets));
            updateStatistics();
        });
    } catch (JsonProcessingException e) {
        System.err.println("Error parsing JSON: " + e.getMessage());
    } catch (Exception e) {
        System.err.println("Unexpected error: " + e.getMessage());
    }
}

    private void initializeData() {
        fetchExoplanetsFromAPI();
    }

    private void setupListeners() {
        searchField.textProperty().addListener((observable, oldValue, newValue) -> {
            FilteredList<Exoplanet> filteredData = new FilteredList<>(exoplanets, p -> true);
            filteredData.setPredicate(exoplanet -> {
                if (newValue == null || newValue.isEmpty()) {
                    return true;
                }
                return exoplanet.getName().toLowerCase().contains(newValue.toLowerCase());
            });
            exoplanetListView.setItems(filteredData);
        });

        sortComboBox.setOnAction(event -> {
            String sortBy = sortComboBox.getValue();
            SortedList<Exoplanet> sortedData = new SortedList<>(exoplanetListView.getItems());
            sortedData.setComparator(switch (sortBy) {
                case "Orbital Period" -> Comparator.comparing(Exoplanet::getOrbitalPeriod);
                case "Size" -> Comparator.comparing(Exoplanet::getSize);
                default -> Comparator.comparing(Exoplanet::getName);
            });
            exoplanetListView.setItems(sortedData);
        });

        exoplanetListView.getSelectionModel().selectedItemProperty().addListener((observable, oldValue, newValue) -> {
            if (newValue != null) {
                updateExoplanetDetails(newValue);
                updateVisualization(newValue);
            }
        });
    }

    private void updateExoplanetDetails(Exoplanet exoplanet) {
        Tab overviewTab = detailsPane.getTabs().get(0);
        VBox overviewContent = (VBox) overviewTab.getContent();
        Label nameLabel = (Label) overviewContent.getChildren().get(0);
        Label descriptionLabel = (Label) overviewContent.getChildren().get(1);

        nameLabel.setText(exoplanet.getName());
        descriptionLabel.setText(exoplanet.getDescription());

        Tab characteristicsTab = detailsPane.getTabs().get(1);
        GridPane characteristicsGrid = (GridPane) characteristicsTab.getContent();
        characteristicsGrid.getChildren().clear();

        addCharacteristic(characteristicsGrid, 0, "Distance", exoplanet.getOrbitalPeriod() + " light years");
        addCharacteristic(characteristicsGrid, 1, "Size", exoplanet.getSize() + " Earth radii");
        // Add more characteristics here
    }

    private void addCharacteristic(GridPane grid, int row, String label, String value) {
        Label labelNode = new Label(label + ":");
        labelNode.setStyle("-fx-font-size: 14px; -fx-text-fill: #BDC3C7;");
        Label valueNode = new Label(value);
        valueNode.setStyle("-fx-font-size: 14px; -fx-text-fill: white;");
        grid.add(labelNode, 0, row);
        grid.add(valueNode, 1, row);
    }

    private void updateVisualization(Exoplanet exoplanet) {
        visualizationPane.getChildren().clear();

        double paneWidth = visualizationPane.getWidth();
        double paneHeight = visualizationPane.getHeight();
        double paneSize = Math.min(paneWidth, paneHeight);
        double centerX = paneWidth / 2;
        double centerY = paneHeight / 2;

        // Scale factors
        double maxRadius = paneSize / 2 * 0.9; // 90% of half the pane size
        double starRadius = maxRadius * 0.2; // 20% of max radius

        // Calculate scaled orbit radius
        double scaleFactor = (exoplanet.getOrbitalPeriod() / 365.0) / 10; // Adjust scaling based on orbital period
        final double orbitRadius = Math.max(starRadius * 1.5, Math.min(maxRadius * scaleFactor, maxRadius * 0.8));

        Circle star = new Circle(centerX, centerY, starRadius, Color.YELLOW);
        
        // Scale planet size based on its actual size, with a minimum and maximum
        double planetRadius = Math.max(2, Math.min(starRadius * 0.3, starRadius * 0.1 * exoplanet.getSize()));
        Circle planet = new Circle(planetRadius, Color.BLUE);

        Line orbitLine = new Line();
        orbitLine.setStroke(Color.GRAY);
        orbitLine.getStrokeDashArray().addAll(5d, 5d);

        // Add orbit ring
        Circle orbitRing = new Circle(centerX, centerY, orbitRadius);
        orbitRing.setFill(Color.TRANSPARENT);
        orbitRing.setStroke(Color.GRAY);
        orbitRing.setStrokeWidth(1);
        orbitRing.getStrokeDashArray().addAll(5d, 5d);

        visualizationPane.getChildren().addAll(orbitRing, orbitLine, star, planet);

        // Stop any existing animation
        animationTimers.values().forEach(AnimationTimer::stop);

        // Create a new animation for the planet's orbit
        AnimationTimer timer = new AnimationTimer() {
            private long lastUpdate = 0;
            private double angle = 0;

            @Override
            public void handle(long now) {
                if (lastUpdate == 0) {
                    lastUpdate = now;
                    return;
                }

                double elapsedSeconds = (now - lastUpdate) / 1_000_000_000.0;
                lastUpdate = now;

                // Use the slider value to adjust the speed
                double speedFactor = speedSlider.getValue() * BASE_SPEED;
                angle += speedFactor * elapsedSeconds;

                double x = centerX + Math.cos(angle) * orbitRadius;
                double y = centerY + Math.sin(angle) * orbitRadius;

                planet.setCenterX(x);
                planet.setCenterY(y);

                orbitLine.setStartX(centerX);
                orbitLine.setStartY(centerY);
                orbitLine.setEndX(x);
                orbitLine.setEndY(y);
            }
        };

        timer.start();
        animationTimers.put(exoplanet.getName(), timer);
    }


    @Override
    public Node getContent() {
        return content;
    }

    @Override
    public void updateContent() {
        fetchExoplanetsFromAPI();
    }

    private static class Exoplanet {
        private final String name;
        private final double orbitalPeriod; // in days
        private final double size; // in Earth radii
        private final String description;
    
        public Exoplanet(String name, double orbitalPeriod, double size, String description) {
            this.name = name;
            this.orbitalPeriod = orbitalPeriod;
            this.size = size;
            this.description = description;
        }
    
        public String getName() { return name; }
        public double getOrbitalPeriod() { return orbitalPeriod; }
        public double getSize() { return size; }
        public String getDescription() { return description; }
    }
}