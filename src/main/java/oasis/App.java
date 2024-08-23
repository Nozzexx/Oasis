package oasis;

import org.kordamp.ikonli.javafx.FontIcon;
import org.kordamp.ikonli.javafx.StackedFontIcon;

import atlantafx.base.theme.NordDark;
import javafx.application.Application;
import javafx.application.Preloader;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.geometry.Rectangle2D;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.stage.Screen;
import javafx.stage.Stage;

public class App extends Application {

    private static final int DEFAULT_WIDTH = 1600;
    private static final int DEFAULT_HEIGHT = 900;
    private static final String APP_NAME = "OASIS";
    private static final String VERSION = "0.1.1a";
    private static final int SIDEBAR_WIDTH = 250; // Sidebar width

    @Override
    public void init() throws Exception {
        // Simulate some loading time
        for (int i = 0; i < 10; i++) {
            double progress = (i + 1) / 10.0;
            notifyPreloader(new Preloader.ProgressNotification(progress));
            Thread.sleep(100); // Reduced sleep time for demonstration
        }
    }

    @Override
    public void start(Stage primaryStage) {
        // Apply AtlantaFX theme
        Application.setUserAgentStylesheet(new NordDark().getUserAgentStylesheet());

        // Create the main layout
        HBox root = new HBox();
        root.setAlignment(Pos.CENTER_LEFT);

        // Create the sidebar
        BorderPane sidebar = createSidebar();
        HBox.setHgrow(sidebar, Priority.NEVER);

        // Create the main content area
        StackPane contentArea = new StackPane();
        HBox.setHgrow(contentArea, Priority.ALWAYS);

        // Add a placeholder content
        Label contentLabel = new Label("Select an option from the sidebar");
        contentArea.getChildren().add(contentLabel);

        // Add sidebar and content area to the root layout
        root.getChildren().addAll(sidebar, contentArea);

        Scene scene = new Scene(root, DEFAULT_WIDTH, DEFAULT_HEIGHT);

        // Set the icon
        try {
            Image icon = new Image(getClass().getResourceAsStream("/exoplanet64.png"));
            primaryStage.getIcons().add(icon);
        } catch (Exception e) {
            System.err.println("Failed to load application icon: " + e.getMessage());
        }

        // Set window properties
        primaryStage.setTitle(APP_NAME + " | Version: " + VERSION);
        primaryStage.setMinWidth(DEFAULT_WIDTH);
        primaryStage.setMinHeight(DEFAULT_HEIGHT);
        primaryStage.setScene(scene);

        // Center the window on the primary screen
        Rectangle2D screenBounds = Screen.getPrimary().getVisualBounds();
        primaryStage.setX((screenBounds.getWidth() - DEFAULT_WIDTH) / 2);
        primaryStage.setY((screenBounds.getHeight() - DEFAULT_HEIGHT) / 2);

        primaryStage.show();
    }

    private BorderPane createSidebar() {
        BorderPane sidebar = new BorderPane();
        sidebar.setPrefWidth(SIDEBAR_WIDTH);
        sidebar.setStyle("-fx-background-color: #010409;"); // Dark background color
    
        // Top section with logo, title, and search
        VBox topSection = new VBox(10);
        topSection.setPadding(new Insets(20, 20, 10, 20));
    
        // Create title with custom icon
        HBox titleBox = new HBox(10);
        titleBox.setAlignment(Pos.CENTER_LEFT);
    
        // Load the custom icon
        Image iconImage = new Image(getClass().getResourceAsStream("/exoplanet64.png"));
        ImageView titleIcon = new ImageView(iconImage);
        titleIcon.setFitHeight(32);
        titleIcon.setFitWidth(32);
        titleIcon.setPreserveRatio(true);
    
        Label logo = new Label("OASIS");
        logo.setStyle("-fx-font-size: 40px; -fx-text-fill: white;");
    
        titleBox.getChildren().addAll(titleIcon, logo);
    
        // Create search bar with icon
        HBox searchBox = new HBox(5);
        searchBox.setAlignment(Pos.CENTER_LEFT);
        searchBox.setStyle("-fx-background-color: #1c1f27; -fx-background-radius: 5;");
        searchBox.setPadding(new Insets(5, 10, 5, 10));
    
        FontIcon searchIcon = new FontIcon("mdi2m-magnify");
        searchIcon.setIconColor(Color.LIGHTGRAY);
    
        TextField search = new TextField();
        search.setPromptText("Search");
        search.setStyle("-fx-background-color: transparent; -fx-text-fill: white; -fx-prompt-text-fill: gray;");
        search.setPrefWidth(SIDEBAR_WIDTH - 60); // Adjust width as needed
        HBox.setHgrow(search, Priority.ALWAYS);
    
        searchBox.getChildren().addAll(searchIcon, search);
    
        topSection.getChildren().addAll(titleBox, searchBox);
    
        // Center section with menu items
        VBox menuItems = new VBox(5);
        menuItems.setPadding(new Insets(20, 20, 20, 20));
    
        String[][] items = {
            {"mdi2h-home", "mdi2h-home-outline", "General"},
            {"mdi2v-view-carousel", "mdi2v-view-carousel-outline", "Containers"},
            {"mdi2c-chart-bar", "mdi2c-chart-bar", "Data Display"},
            {"mdi2m-message", "mdi2m-message-outline", "Feedback"},
            {"mdi2t-text-box", "mdi2t-text-box-outline", "Inputs & Controls"},
            {"mdi2n-navigation", "mdi2n-navigation", "Navigation"},
            {"mdi2s-star", "mdi2s-star-outline", "Showcase"}
        };
        
        for (String[] item : items) {
            HBox menuItemBox = new HBox(10);
            menuItemBox.setAlignment(Pos.CENTER_LEFT);
            
            FontIcon innerIcon = new FontIcon(item[0]);
            innerIcon.getStyleClass().add("inner-icon");
            FontIcon outerIcon = new FontIcon(item[1]);
            outerIcon.getStyleClass().add("outer-icon");
            
            StackedFontIcon stackedIcon = new StackedFontIcon();
            stackedIcon.getChildren().addAll(outerIcon, innerIcon);
            
            // Add CSS for the stacked icon
            stackedIcon.setStyle(
                ".stacked-ikonli-font-icon > .outer-icon { -fx-icon-size: 24px; -fx-icon-color: white; }" +
                ".stacked-ikonli-font-icon > .inner-icon { -fx-icon-size: 16px; -fx-icon-color: #4a90e2; }"
            );
            
            Label text = new Label(item[2]);
            text.setTextFill(Color.WHITE);
            
            menuItemBox.getChildren().addAll(stackedIcon, text);
            
            Button menuButton = new Button();
            menuButton.setGraphic(menuItemBox);
            menuButton.getStyleClass().addAll("button-outlined", "accent");
            menuButton.setMaxWidth(Double.MAX_VALUE);
            menuButton.setAlignment(Pos.CENTER_LEFT);
            
            menuItems.getChildren().add(menuButton);
        }
    
        // Bottom section with centered version label
        Label version = new Label("v" + VERSION);
        version.getStyleClass().add("version-label");
        StackPane bottomSection = new StackPane(version);
        bottomSection.setPadding(new Insets(10, 0, 10, 0));
        StackPane.setAlignment(version, Pos.CENTER);
    
        sidebar.setTop(topSection);
        sidebar.setCenter(menuItems);
        sidebar.setBottom(bottomSection);
    
        return sidebar;
    }

    public static void main(String[] args) {
        System.setProperty("javafx.preloader", SplashScreen.class.getCanonicalName());
        launch(args);
    }
}