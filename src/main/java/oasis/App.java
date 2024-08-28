package oasis;

//#region Imports
import org.kordamp.ikonli.javafx.FontIcon;

import atlantafx.base.theme.NordDark;
import javafx.application.Application;
import javafx.application.Platform;
import javafx.application.Preloader;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.geometry.Rectangle2D;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.control.ToggleButton;
import javafx.scene.control.ToggleGroup;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.Region;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.stage.Screen;
import javafx.stage.Stage;
import oasis.panels.ContentPanel;
import oasis.panels.DashboardPanel;
import oasis.panels.DataDisplayPanel;
import oasis.panels.DebrisTrackingPanel;
import oasis.panels.ExoplanetPanel;
import oasis.panels.OrbitalRegionsPanel;
import oasis.panels.RiskAssessmentPanel;
import oasis.panels.SatelliteStatusPanel;
import oasis.panels.SettingsPanel;
import oasis.panels.SpaceWeatherPanel;
//#endregion

public class App extends Application {

    private static final int DEFAULT_WIDTH = 1600;
    private static final int DEFAULT_HEIGHT = 900;
    private static final String APP_NAME = "OASIS";
    private static final String VERSION = "0.0.1";
    private static final int SIDEBAR_WIDTH = 250;

    private static final double EXPANDED_BUTTON_HEIGHT = 40;
    private static final double COLLAPSED_BUTTON_SIZE = 70;

    private StackPane contentArea;
    private BorderPane sidebar;
    private ToggleButton toggleButton;
    private TextField searchField;
    private String selectedMenuItem = "Dashboard"; // Default selection

    @Override
    public void init() throws Exception {
        // Simulate some loading time
        for (int i = 0; i < 10; i++) {
            double progress = (i + 1) / 10.0;
            notifyPreloader(new Preloader.ProgressNotification(progress));
            Thread.sleep(100);
        }
    }

    @Override
    public void start(Stage primaryStage) {
        // Apply AtlantaFX theme
        Application.setUserAgentStylesheet(new NordDark().getUserAgentStylesheet());

        // Create the main layout
        BorderPane root = new BorderPane();

        // Create the sidebar
        sidebar = createSidebar();
        root.setLeft(sidebar);

        // Create the main content area
        contentArea = new StackPane();
        root.setCenter(contentArea);

        // Add a placeholder content
        Label contentLabel = new Label("Select an option from the sidebar");
        contentArea.getChildren().add(contentLabel);

        Scene scene = new Scene(root, DEFAULT_WIDTH, DEFAULT_HEIGHT);
        scene.getStylesheets().add(getClass().getResource("/styles.css").toExternalForm());

        // Set the icon
        try {
            Image icon = new Image(getClass().getResourceAsStream("/exoplanet64.png"));
            primaryStage.getIcons().add(icon);
        } catch (Exception e) {
            System.err.println("Failed to load application icon: " + e.getMessage());
        }

        // Set window properties
        primaryStage.setTitle(APP_NAME + " | v" + VERSION);
        primaryStage.setMinWidth(DEFAULT_WIDTH);
        primaryStage.setMinHeight(DEFAULT_HEIGHT);
        primaryStage.setScene(scene);

        // Center the window on the primary screen
        Rectangle2D screenBounds = Screen.getPrimary().getVisualBounds();
        primaryStage.setX((screenBounds.getWidth() - DEFAULT_WIDTH) / 2);
        primaryStage.setY((screenBounds.getHeight() - DEFAULT_HEIGHT) / 2);

        primaryStage.show();

        // Force layout update, apply styles, and expand sidebar after a short delay
        Platform.runLater(() -> {
            expandSidebar();
            sidebar.applyCss();
            sidebar.layout();
            root.applyCss();
            root.layout();
            scene.getRoot().applyCss();
            scene.getRoot().layout();
        });
    }

    private BorderPane createSidebar() {
        BorderPane sidebar = new BorderPane();
        sidebar.setPrefWidth(SIDEBAR_WIDTH);
        sidebar.setStyle("-fx-background-color: #010409;");
    
        // Create expanded content
        VBox expandedContent = createExpandedContent();
    
        // Create collapsed content
        VBox collapsedContent = createCollapsedContent();
    
        // Create toggle button
        toggleButton = new ToggleButton();
        FontIcon collapseIcon = new FontIcon("mdi2c-chevron-left-box");
        FontIcon expandIcon = new FontIcon("mdi2c-chevron-right-box");
        collapseIcon.setIconColor(Color.WHITE);
        expandIcon.setIconColor(Color.WHITE);
        collapseIcon.setIconSize(30);
        expandIcon.setIconSize(30);
        toggleButton.setGraphic(collapseIcon);
        toggleButton.getStyleClass().add("toggle-button");
    
        toggleButton.setPrefSize(30, 30);
        toggleButton.setMinSize(30, 30);
        toggleButton.setMaxSize(30, 30);
    
        // Create logo
        Image iconImage = new Image(getClass().getResourceAsStream("/exoplanet64.png"));
        ImageView logoIcon = new ImageView(iconImage);
        logoIcon.setFitHeight(32);
        logoIcon.setFitWidth(32);
        logoIcon.setPreserveRatio(true);
    
        // Create title
        Label titleLabel = new Label("OASIS");
        titleLabel.setStyle("-fx-font-size: 40px; -fx-text-fill: white; -fx-font-weight: bold;");
    
        // Create a container for the logo and title
        HBox logoTitleBox = new HBox(10);
        logoTitleBox.setAlignment(Pos.CENTER_LEFT);
        logoTitleBox.getChildren().addAll(logoIcon, titleLabel);
    
        // Create a container for the logo, title, and toggle button
        HBox topContainer = new HBox(10);
        topContainer.setAlignment(Pos.CENTER);
        topContainer.setPadding(new Insets(5,10,10,20));
    
        // Add a spacer to push the toggle button to the right
        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);
        
        // Combine logo, title, spacer, and toggle button
        topContainer.getChildren().addAll(logoTitleBox, spacer, toggleButton);
    
        // Set up the sidebar layout
        StackPane sidebarContent = new StackPane(expandedContent, collapsedContent);
        sidebar.setTop(topContainer);
        sidebar.setCenter(sidebarContent);
    
        // Set up toggle behavior
        toggleButton.setOnAction(e -> {
            if (toggleButton.isSelected()) {
                // Collapse
                sidebar.setCenter(createCollapsedContent());
                toggleButton.setGraphic(expandIcon);
                sidebar.setPrefWidth(15); 
                titleLabel.setVisible(false);
                logoTitleBox.getChildren().remove(titleLabel);
                topContainer.getChildren().clear();
                topContainer.getChildren().addAll(logoIcon, toggleButton);
                topContainer.setAlignment(Pos.CENTER);
                HBox.setMargin(logoIcon, new Insets(10, 0, 0, 20));
                HBox.setMargin(spacer, Insets.EMPTY);
                HBox.setMargin(toggleButton, new Insets(4,0, 0, -15));
            } else {
                // Expand
                sidebar.setCenter(createExpandedContent());
                toggleButton.setGraphic(collapseIcon);
                sidebar.setPrefWidth(SIDEBAR_WIDTH);
                titleLabel.setVisible(true);
                logoTitleBox.getChildren().clear();
                logoTitleBox.getChildren().addAll(logoIcon, titleLabel);
                logoTitleBox.setAlignment(Pos.CENTER_LEFT);
                topContainer.getChildren().clear();
                topContainer.getChildren().addAll(logoTitleBox, spacer, toggleButton);
                topContainer.setAlignment(Pos.CENTER_LEFT);
                HBox.setMargin(logoIcon, new Insets(0));
            }
        });
    
        // Add animation
        sidebar.widthProperty().addListener((obs, oldWidth, newWidth) -> {
            double opacity = newWidth.doubleValue() / SIDEBAR_WIDTH;
            expandedContent.setOpacity(opacity);
            collapsedContent.setOpacity(1);
        });
    
        return sidebar;
    }

    private VBox createExpandedContent() {
        VBox expandedContent = new VBox(10);
        expandedContent.setPadding(new Insets(10, 20, 10, 20));

        // Create search bar with icon
        HBox searchBox = new HBox(5);
        searchBox.setAlignment(Pos.CENTER_LEFT);
        searchBox.setStyle("-fx-background-color: #1f2937; -fx-background-radius: 5;");
        searchBox.setPadding(new Insets(5, 10, 5, 10));

        FontIcon searchIcon = new FontIcon("mdi2m-magnify");
        searchIcon.setIconColor(Color.LIGHTGRAY);

        searchField = new TextField();
        searchField.setPromptText("Search");
        searchField.setStyle("-fx-background-color: transparent; -fx-text-fill: white; -fx-prompt-text-fill: gray;");
        searchField.setPrefWidth(SIDEBAR_WIDTH - 60);
        HBox.setHgrow(searchField, Priority.ALWAYS);

        searchBox.getChildren().addAll(searchIcon, searchField);

        // Menu items
        VBox menuItems = new VBox(5);
        menuItems.setPadding(new Insets(20, 0, 20, 0));

        ToggleGroup toggleGroup = new ToggleGroup();

        String[][] items = {
            {"mdi2h-home", "Dashboard"},
            {"mdi2o-orbit", "Orbital Regions"},
            {"mdi2c-chart-bar", "Data Display"},
            {"mdi2w-white-balance-sunny", "Space Weather"},
            {"mdi2t-trash-can", "Debris Tracking"},
            {"mdi2a-alert", "Risk Assessment"},
            {"mdi2s-satellite-variant", "Satellite Status"},
            {"mdi2e-earth", "Exoplanets"},
            {"mdi2a-account-cog", "Settings"}
        };
        
        for (String[] item : items) {
            HBox menuItemBox = new HBox(10);
            menuItemBox.setAlignment(Pos.CENTER_LEFT);
            
            FontIcon icon = new FontIcon(item[0]);
            icon.setIconColor(Color.WHITE);
            icon.setIconSize(24);
            
            Label text = new Label(item[1]);
            text.setTextFill(Color.WHITE);
            
            menuItemBox.getChildren().addAll(icon, text);
            
            ToggleButton menuButton = new ToggleButton();
            menuButton.setGraphic(menuItemBox);
            menuButton.getStyleClass().addAll("button-outlined", "accent");
            menuButton.setMaxWidth(Double.MAX_VALUE);
            menuButton.setAlignment(Pos.CENTER_LEFT);
            menuButton.setMnemonicParsing(true);
            menuButton.setToggleGroup(toggleGroup);
            
            menuButton.setPrefHeight(EXPANDED_BUTTON_HEIGHT);
            menuButton.setMinHeight(EXPANDED_BUTTON_HEIGHT);
            menuButton.setMaxHeight(EXPANDED_BUTTON_HEIGHT);
            
            menuButton.setOnAction(e -> {
                selectedMenuItem = item[1];
                switchPanel(item[1]);
            });

            // Set the initial selection state
            if (item[1].equals(selectedMenuItem)) {
                menuButton.setSelected(true);
            }
            
            menuItems.getChildren().add(menuButton);
        }

        // Bottom section with version label
        Label version = new Label("v" + VERSION);
        version.getStyleClass().add("version-label");
        StackPane versionPane = new StackPane(version);
        versionPane.setPadding(new Insets(10, 0, 10, 0));
        StackPane.setAlignment(version, Pos.CENTER);

        expandedContent.getChildren().addAll(searchBox, menuItems, versionPane);
        VBox.setVgrow(menuItems, Priority.ALWAYS);

        return expandedContent;
    }

    private VBox createCollapsedContent() {
        VBox collapsedContent = new VBox();
        collapsedContent.setAlignment(Pos.TOP_CENTER);
        collapsedContent.setPadding(Insets.EMPTY);
    
        // Create a VBox for buttons
        VBox buttonBox = new VBox(5);
        buttonBox.setPadding(new Insets(10, 0, 10, 0));
        buttonBox.setAlignment(Pos.TOP_CENTER);
    
        // Add search button
        FontIcon searchIcon = new FontIcon("mdi2m-magnify");
        searchIcon.setIconColor(Color.WHITE);
        searchIcon.setIconSize(16);

        Button searchButton = new Button();
        searchButton.setOpacity(1);
        searchButton.setGraphic(searchIcon);
        searchButton.getStyleClass().addAll("accent", "icon-button");
        searchButton.setPrefSize(COLLAPSED_BUTTON_SIZE, 40);
        searchButton.setMinSize(COLLAPSED_BUTTON_SIZE, 40);
        searchButton.setMaxSize(COLLAPSED_BUTTON_SIZE, 40);
        searchButton.setAlignment(Pos.CENTER);
        searchButton.setPadding(Insets.EMPTY);
        searchButton.setMnemonicParsing(true);
        searchButton.setOnAction(e -> expandAndSearch());

        buttonBox.getChildren().add(searchButton);
    
        // Add existing menu items
        ToggleGroup toggleGroup = new ToggleGroup();

        String[][] items = {
            {"mdi2h-home", "Dashboard"},
            {"mdi2o-orbit", "Orbital Regions"},
            {"mdi2c-chart-bar", "Data Display"},
            {"mdi2w-white-balance-sunny", "Space Weather"},
            {"mdi2t-trash-can", "Debris Tracking"},
            {"mdi2a-alert", "Risk Assessment"},
            {"mdi2s-satellite-variant", "Satellite Status"},
            {"mdi2e-earth", "Exoplanets"},
            {"mdi2a-account-cog", "Settings"}
        };
    
        for (String[] item : items) {
            FontIcon icon = new FontIcon(item[0]);
            icon.setIconColor(Color.WHITE);
            icon.setIconSize(24);

            ToggleButton iconButton = new ToggleButton();
            iconButton.setOpacity(1);
            iconButton.setGraphic(icon);
            iconButton.getStyleClass().addAll("accent", "icon-button");
            
            iconButton.setPrefSize(COLLAPSED_BUTTON_SIZE, 40);
            iconButton.setMinSize(COLLAPSED_BUTTON_SIZE, 40);
            iconButton.setMaxSize(COLLAPSED_BUTTON_SIZE, 40);
            
            iconButton.setAlignment(Pos.CENTER);
            iconButton.setPadding(Insets.EMPTY);
            iconButton.setOnAction(e -> {
                selectedMenuItem = item[1];
                switchPanel(item[1]);
            });
            iconButton.setMnemonicParsing(true);
            iconButton.setToggleGroup(toggleGroup);

            // Set the initial selection state
            if (item[1].equals(selectedMenuItem)) {
                iconButton.setSelected(true);
            }
            
            buttonBox.getChildren().add(iconButton);
        }
    
        // Create version label
        Label version = new Label("v" + VERSION);
        version.getStyleClass().add("version-label");
        StackPane versionPane = new StackPane(version);
        versionPane.setPadding(new Insets(10, 0, 20, 0));
        StackPane.setAlignment(version, Pos.CENTER);
    
        collapsedContent.getChildren().addAll(buttonBox, versionPane);
        VBox.setVgrow(buttonBox, Priority.ALWAYS);
    
        return collapsedContent;
    }

    private void expandAndSearch() {
        if (toggleButton.isSelected()) {
            toggleButton.fire(); // Expand the sidebar
        }
        searchField.requestFocus(); // Focus on the search field
    }

    private void switchPanel(String panelName) {
        selectedMenuItem = panelName; // Update the selected menu item
        ContentPanel panel = switch (panelName) {
            case "Dashboard" -> new DashboardPanel();
            case "Orbital Regions" -> new OrbitalRegionsPanel();
            case "Data Display" -> new DataDisplayPanel();
            case "Space Weather" -> new SpaceWeatherPanel();
            case "Debris Tracking" -> new DebrisTrackingPanel();
            case "Risk Assessment" -> new RiskAssessmentPanel();
            case "Satellite Status" -> new SatelliteStatusPanel();
            case "Exoplanets" -> new ExoplanetPanel();
            case "Settings" -> new SettingsPanel();
            default -> new DashboardPanel();
        };

        contentArea.getChildren().clear();
        contentArea.getChildren().add(panel.getContent());
        panel.updateContent();
    }

    private void expandSidebar() {
        if (toggleButton.isSelected()) {
            toggleButton.fire(); // This will deselect the button and trigger the expand action
        } else {
            // If it's already expanded, we still want to trigger the expand logic
            sidebar.setCenter(createExpandedContent());
            sidebar.setPrefWidth(SIDEBAR_WIDTH);
            
            HBox topContainer = (HBox) sidebar.getTop();
            HBox logoTitleBox = (HBox) topContainer.getChildren().get(0);
            Label titleLabel = (Label) logoTitleBox.getChildren().get(1);
            titleLabel.setVisible(true);
            logoTitleBox.setAlignment(Pos.CENTER_LEFT);
            
            if (topContainer.getChildren().size() == 2) {
                Region spacer = new Region();
                HBox.setHgrow(spacer, Priority.ALWAYS);
                topContainer.getChildren().add(1, spacer);
            }
            topContainer.setAlignment(Pos.CENTER_LEFT);
            
            FontIcon collapseIcon = new FontIcon("mdi2c-chevron-left-box");
            collapseIcon.setIconColor(Color.WHITE);
            collapseIcon.setIconSize(30);
            toggleButton.setGraphic(collapseIcon);
        }
    }

    public static void main(String[] args) {
        System.setProperty("javafx.preloader", SplashScreen.class.getCanonicalName());
        launch(args);
    }
}